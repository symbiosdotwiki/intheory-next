precision highp float;

#define AA 1  //change to 1 to increase performance

#define _Speed .4  //disk rotation speed

#define _Steps  4. //disk texture2D layers
// #define bhSize 0.3 //size of BH

uniform vec2 resolution;
uniform sampler2D sphereMap;
uniform sampler2D pebbles;
uniform float TIME;
uniform float bhTIME;
uniform float MOUSEX;
uniform float MOUSEY;
uniform float bhRad;
uniform float bhDist;
uniform float bhX;
uniform float bhSeparation;
uniform vec3 iAudio;
uniform float hueShift;
uniform float camDist;
uniform float starBright;
uniform bool HD;

// const vec2 MOUSE = vec2(.5, 60.);

const int MAX_MARCHING_STEPS = 15;
const int diskSteps = 10;
const int exitSteps = 6;

const float discThickness = .001;

const float MIN_DIST = 100.0;
const float MAX_DIST = 200.0;
const float EPSILON = 0.0001;
const float PI = 3.1415926535897;

const float starSize = .05;
const int numStars = 6;
vec3 starPos[6];
float starSizes[6];
vec3 ogPos;

float bhSize;

float sigmoid(float x){
    return 1./(1. + exp(-x));
}

float rand(float n){return fract(sin(n) * 43758.5453123);}

vec3 hsv2rgb(vec3 c) {
    c.x = mod(c.x, 1.);
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 hsv2rgb(float r, float g, float b) {
  return hsv2rgb(vec3(r, g, b));
}

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

vec3 blendNormal(vec3 normal){
    vec3 blending = abs(normal);
    blending = normalize(max(blending, 0.00001));
    blending /= vec3(blending.x + blending.y + blending.z);
    return blending;
}

vec3 triplanarMapping (sampler2D texture, vec3 normal, vec3 position) {
  vec3 normalBlend = blendNormal(normal);
    vec3 xColor = texture2D(texture, position.yz).rgb;
    vec3 yColor = texture2D(texture, position.xz).rgb;
    vec3 zColor = texture2D(texture, position.xy).rgb;

  return (xColor * normalBlend.x + yColor * normalBlend.y + zColor * normalBlend.z);
}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

mat3 m3 = mat3( 0.00,  0.80,  0.60,
              -0.80,  0.36, -0.48,
              -0.60, -0.48,  0.64 );

float grid(vec3 p)
{
    float s = sin(p.x)*cos(p.y);
    //float s = sin(p.x)*cos(p.y);
    return s;
}

float flow(vec4 pppp)
{
    vec3 p = pppp.xyz;
    float z=2.;
    float rz = 0.;
    vec3 bp = p;
    float ttt = pppp.w;
    

    for (float i= 1.;i < 5.;i++ )
    {
        //movement
        p += ttt*.6;
        bp -= ttt*.3;
        
        //displacement map
        vec3 gr = vec3(grid(p*3.-ttt*1.),grid(p*3.5+4.-ttt*1.),grid(p*4.+4.-ttt*1.));
        p += gr*0.15;
        rz+= (sin(noise(p)*8.)*0.5+0.5) /z;
        
        //advection factor (.1 = billowing, .9 high advection)
        p = mix(bp,p,.7);
        
        //scale and rotate
        z *= 2.;
        p *= 2.01;
        p*=m3;
        bp *= 1.7;
        bp*=m3;
    }
    return rz;  
}

vec2 unitCircle(float angle){
    return vec2(cos(angle), sin(angle));
}

vec4 background(vec3 ray, vec2 ogUV)
{
    vec2 uv = ray.xy;
    
    // if( abs(ray.x) > 0.5)
    //     uv.x = ray.z;
    // else if( abs(ray.y) > 0.5)
    //     uv.y = ray.z;

    float dist = length(ogUV-vec2(.5));
    // dist = .004;
    dist -= .25;
    dist = .001/(1.+dist*dist);

    float scaling = 1.;
    vec4 nebulaeR = texture2D(sphereMap, mod(uv, vec2(scaling, scaling) )/scaling);
    vec4 nebulaeG = texture2D(sphereMap, mod(uv*(1.+dist), vec2(scaling, scaling) )/scaling);
    vec4 nebulaeB = texture2D(sphereMap, mod(uv*(1.-dist), vec2(scaling, scaling) )/scaling);
    // nebulae.xyz += nebulae.xxx + nebulae.yyy + nebulae.zzz; //average color
    vec4 nebulae = vec4(nebulaeR.r, nebulaeG.g, nebulaeB.b, nebulaeR.a);
    vec3 nebulaeHSV = rgb2hsv(nebulae.xyz) + vec3(.35, -.1, .0);
// return nebulaeR;
	return vec4(starBright * hsv2rgb(nebulaeHSV), 1.);
}

vec4 raymarchDisk(vec3 ray, vec3 zeroPos)
{
    //return vec4(1.,1.,1.,0.); //no disk

    float stepsHD = _Steps;
    // if(!HD){
    //     stepsHD = _Steps/3.;
    // }
    
	vec3 position = zeroPos;      
    float lengthPos = length(position.xz);
    float dist = 0.1 * min(1., .5*lengthPos) * 1. / (stepsHD * abs(ray.y) );

    position += dist * stepsHD * ray * 0.5;     

    vec2 deltaPos;
    deltaPos.x = -0.01 * zeroPos.z + zeroPos.x;
    deltaPos.y = 0.01 * zeroPos.x + zeroPos.z;
    deltaPos = normalize(deltaPos - zeroPos.xz);
    
    float parallel = dot(ray.xz, deltaPos);
    parallel /= 2. * sqrt(lengthPos);
    float redShift = parallel + 0.3;
    redShift = clamp(redShift, 0., 1.);

    float hueShift = -.3;
    
    float disMix = clamp(0.24 * (lengthPos - bhSize * 2.) / bhSize, 0., 1.);
    vec3 insideCol =  mix(hsv2rgb(.5+hueShift, .9, 1.), hsv2rgb(.9+hueShift, .9, 1.)*.5, pow(disMix, .5));
    
    insideCol *= mix(hsv2rgb(.45+hueShift, .9, 1.), hsv2rgb(.2+hueShift, .9, 1.), redShift);
	insideCol *= 1.25;
    redShift += 0.18;
    redShift *= redShift;

    float theta = (atan(position.z, position.x) + PI) / (2. * PI);
    float phi = mod((atan(position.z, position.x) + 2. * PI) / (2. * PI), 1.);    

    vec4 oCol = vec4(0.);

    

    for(float i = 0. ; i < _Steps; i++)
    {      
        if(!HD && i > stepsHD){
            break;
        }                
        position -= dist * ray ;  

        float intensity = clamp( 1. - abs( 2. * (i - 0.8) / stepsHD ), 0., 1.); 
        float lengthPos = length(position.xz);
        float distMult = 2.;

        // diameter of disc
        vec2 discSize = vec2(.75, .1);
        distMult *=  clamp(2. * (lengthPos -  bhSize * discSize.x) * discSize.x / bhSize, 0., 1.);        
        distMult *= clamp(( 3. - lengthPos) * 3.0, 0., 1.);
        distMult *= distMult;

        // float rrr = lengthP
  
        const float f = 70.;
        // float noise = .5 * flow( 50. * vec3( angle * lengthPos, 0.03 * u , 2. * f));
        // noise += .5 * flow( 50. * vec3( angle * lengthPos, 0.03 * u, 4. * f));     
        float noise1 = .5 * flow( vec4( lengthPos * 3., theta * 20.  + 100. / (lengthPos + 3.) , 2. * f, bhTIME   + iAudio[2]));
        float noise2 = .5 * flow( vec4( lengthPos * 3., phi * 20.  + 100. / (lengthPos + 3.) , 4. * f, bhTIME  + iAudio[2]));
        float noise = noise1 * abs(1. - 2. * phi) + noise2 * abs(1. - 2. * theta);
        // noise += .5 * flow( 50. * vec3( position.xz / 4., 4. * f)); 

        float extraWidth =  noise * (1. -  clamp(2. * i / stepsHD - 1., 0., 1.));

        float alpha = 10. * noise * (intensity + extraWidth) * ( 4. + 0.01 ) *  dist * distMult;
        // alpha -= (lengthPos * .5) / bhSize;
        float bhAmix = 1.-pow(bhSize * 2., 1.);
        alpha = mix(alpha, (1.-lengthPos * 2.) * alpha * bhAmix, bhAmix);
        alpha = clamp( alpha , 0., 1.);


        vec3 col = 2. * mix( hsv2rgb(0.+hueShift, .9, 1.) * insideCol, insideCol, min(1.,intensity*2.));
        oCol = (1.-alpha) * oCol + alpha * vec4(col, 1.);
        oCol.rgb += 1. * redShift * (intensity + 0.5) * distMult * bhSize * bhSize /(stepsHD*lengthPos*lengthPos);
    }  
 
    oCol.rgb = clamp(oCol.rgb , 0., 1.);
    return oCol ;
}

vec3 getStarPos(int id) {
    for (int i=0; i<numStars; i++) {
        if (i == id) return starPos[i];
    }
}

float getStarSize(int id) {
    for (int i=0; i<numStars; i++) {
        if (i == id) return starSizes[i];
    }
}

float starDist(vec3 pos, int i){
    return length(pos - getStarPos(i)) - getStarSize(i);
}

vec3 starNormal( vec3 pos, int i){
 vec3 eps = vec3(0.001, 0.0, 0.0);
 vec3 p = vec3(pos);
 vec3 n = normalize( vec3(
     starDist(p+eps.xyy, i)-starDist(p-eps.xyy, i),
     starDist(p+eps.yxy, i)-starDist(p-eps.yxy, i),
     starDist(p+eps.yyx, i)-starDist(p-eps.yyx, i)
 ) );
 return n;
}


void Rotate( inout vec3 vector, vec2 angle )
{
	vector.yz = cos(angle.y)*vector.yz
				+sin(angle.y)*vec2(-1,1)*vector.zy;
	vector.xz = cos(angle.x)*vector.xz
				+sin(angle.x)*vec2(-1,1)*vector.zx;
}

vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
    vec2 xy = fragCoord - size / 2.0;
    float z = size.y / tan(radians(fieldOfView) / 2.0);
    return normalize(vec3(xy, -z));
}

mat3 viewMatrix(vec3 eye, vec3 center, vec3 up) {
    vec3 f = normalize(center - eye);
    vec3 s = normalize(cross(f, up));
    vec3 u = cross(s, f);
    return mat3(s, u, -f);
}

void applyBendForce(inout vec3 pos, inout vec3 ray, vec3 bhPos, float bhRadd){
    float dotpos = dot(pos-bhPos, pos-bhPos);
    float invDist = inversesqrt(dotpos); // 1/distance to BH
    float centDist = dotpos * invDist;  // distance to BH
    float stepDist = 0.92 * abs(pos.y /(ray.y));  // conservative distance to disk (y==0)

    float starMin = 9999.;
    for(int i = 0; i < numStars; i ++){
        if(!HD && i >= numStars / 2){
            continue;
        }
        float starDist = length(pos - starPos[i]) - getStarSize(i);
        if( starDist < starMin){
            starMin = starDist;
        }
    }

    if(!HD){
        starMin *= .5;
    }
    // else{
    //     starMin *= .25;
    // }
    

    float farLimit = centDist * 0.5; // limit step size far from to BH
    float closeLimit = centDist*0.1 + 0.05*centDist*centDist*(1./bhRadd); //limit step size closse to BH
    stepDist = min(min(stepDist, min(farLimit, closeLimit)), starMin);

    // stepDist = starMin;
    
    float invDistSqr = invDist * invDist;
    float bendForce = stepDist * invDistSqr * bhRadd * 0.625;  //bending force
    ray = normalize(ray - (bendForce * invDist )*pos);
    pos += stepDist * normalize(ray); 
}

void renderStars(in vec3 pos, inout vec4 col, inout bool hitStar){
    for(int i = 0; i < numStars; i ++){
        if(!HD && i >= numStars / 2){
            break;
        }
        vec3 pDif = pos - starPos[i];
        float sDist = length(pDif);
        float sFrac = float(i) / float(numStars);
        if(sDist < getStarSize(i) + .01){
            vec3 sNorm = normalize(starNormal(pos, i) * .5+ .5);
            float psDist = length(ogPos - starPos[i]);
            // Rotate(sNorm, vec2(TIME*.8, TIME*1.));
            Rotate(pDif, vec2(TIME*.8, TIME*1.));
            sNorm = pow(sNorm, vec3(1.));
            float distPow = (1. - sigmoid((psDist - length(ogPos)) * 2.));
            float sunSpot = 1. * pow(triplanarMapping(pebbles, sNorm, 2. * (rand(sFrac*30.) + .5) * pDif + sFrac).r, 1.);
            // distPow = 1.;
            vec3 pebCol = hsv2rgb(
                3.5 * sunSpot * (sFrac + .2) + .08*TIME * (1. + 3.*rand(sFrac)), 
                1. - sunSpot, 
                sunSpot * distPow
            );
            // pebCol *= distPow;
            col = vec4(
                  col.a * col.rgb + (1. - col.a) * pebCol,// / pow(max(length(ogPos - pos), 1.), 6.), 
                1.
            );
            hitStar = true;
            break;
        }
        if(hitStar)
        break;
    }
}

void main()
{

    vec3 viewDir = rayDirection(45.0, resolution, gl_FragCoord.xy);
    vec3 pos = vec3(camDist*cos((MOUSEY - .5)*PI), camDist * sin((MOUSEY - .5)*PI), 5.);
    
    mat3 viewToWorld = viewMatrix(pos, vec3(0.0, 0.0, 0.0), vec3(0.0, cos((MOUSEX - .5)*PI), sin((MOUSEX - .5)*PI)));
    
    vec3 ray = viewToWorld * viewDir;

    vec2 angle = vec2( TIME * 0.05 + .9, 0.3 );      
    Rotate(pos, angle);
    Rotate(ray, angle);

    ogPos = vec3(pos);

    vec3 bhLoc1 = bhDist*vec3(0., bhSeparation, 0.);
    vec3 bhLoc2 = -bhLoc1;
    vec3 bhOffset = vec3(0., bhX, 0.);
    bhLoc1 +=  bhOffset;
    bhLoc2 -=  bhOffset;

    bhSize = bhRad + bhRad * iAudio[0] * .1 + .01;

    for(int i = 0; i < numStars; i ++){
        float sFrac = float(i) / float(numStars);
        // if(!HD && i >= numStars / 2){
        //     continue;
        // }
        float theta = PI * sFrac;
        float phi = TIME * .2;
        // phi *= 3.;
        phi *= rand(float(i + 1)) + 1.;
        phi += 2.*PI * rand(float(i + 999));
        float randR = (2. + rand(float(i * 100)) );
        // randR = 1.;
        starPos[i] = randR * vec3( 
            sin(phi)*cos(theta), 
            cos(phi),
            sin(phi)*sin(theta)
        );
        starSizes[i] = starSize * (1. + 3.*rand(sFrac));
    }


    vec4 col = vec4(0.); 
    vec4 outCol =vec4(100.);

    for(int disks = 0; disks < diskSteps; disks++) //steps
    {
        // if(!HD && disks > diskSteps / 2){
        //     continue;
        // }     
        bool hitStar = false;
        for (int h = 0; h < exitSteps; h++) // reduces tests for exit conditions (to minimise branching)
        {
            // if(!HD && h > exitSteps / 2){
            //     continue;
            // }
            applyBendForce(pos, ray, bhLoc1, bhSize);
            renderStars(pos, col, hitStar);
            if(hitStar)
                break;
            applyBendForce(pos, ray, bhLoc2, bhSize);
            // renderStars(pos, col, hitStar);
            if(hitStar)
                break;
        }
        if(hitStar)
                break;

        float dist21 = length(pos - bhLoc1);
        float dist22 = length(pos - bhLoc2);

        if(dist21 < bhSize * 0.1 || dist22 < bhSize * 0.1 ) //ray sucked in to BH
        {
            outCol =  vec4( col.rgb * col.a ,1.) ;
            // outCol = vec4(vec3(0.), 1.);
            break;
        }

        else if(dist21 > bhSize * 10000. && dist22 > bhSize * 10000.) //ray escaped BH
        {                   
            vec4 bg = background(ray, gl_FragColor.xy/resolution);
            outCol = vec4(col.rgb*col.a + bg.rgb*(1.-col.a) , 1.);       
            break;
        }

        else if (abs(pos.y) <= bhSize * discThickness ) //ray hit accretion disk
        {                             
            vec4 diskCol = raymarchDisk(ray, pos);   //render disk
            vec3 hDiskCol = hsv2rgb(rgb2hsv(diskCol.rgb) + vec3(hueShift, 0., 0.));
            diskCol.rgb = hDiskCol;
            pos.y = 0.;
            pos += abs(bhSize * discThickness / (2. * ray.y) ) * ray;  
            col = vec4(diskCol.rgb * (1.-col.a) + col.rgb, col.a + diskCol.a * (1.-col.a));
            // break;
        }
    }

    //if the ray never escaped or got sucked in
    if(outCol.r == 100.)
        outCol = vec4(col.rgb, 1.);

    col = outCol;
    // col.rgb =  pow( col.rgb, vec3(0.6) );
    
    gl_FragColor += col;
}
