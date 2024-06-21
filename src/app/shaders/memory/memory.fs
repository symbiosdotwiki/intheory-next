precision highp float;

struct Ray{
  vec3 p;
  int obj;
  float d;
  vec4 col;
  vec3 n;
};

struct dObj{
    float d;
    int obj;
};

uniform float iTime;
uniform vec3 lmh;
uniform vec2 iResolution;
uniform bool HD;
uniform sampler2D HDRI;
uniform sampler2D rand;

// ANIMATION
uniform float targetDist;
uniform float warpy;
uniform float twisty;
uniform float rayHeight;
uniform vec2 upDir;
uniform float fisheye;
uniform float hueShift;
uniform float rayPos;
uniform float playTime;

const float PI = 3.14159265359;
const float epsilon = 0.01;

vec3 rayOrigin;

float cellWidth = 10.;

vec2 uCir(float theta){
    return vec2(cos(theta), sin(theta));
}

float sigmoid(float x){
    return 1./(1. + exp(-x));
}

vec2 revSpherical(vec3 xyz){
    float phi = acos(xyz.z/length(xyz));
    float theta = atan(xyz.y, xyz.x);
    return vec2(theta/(2.*PI) + .5, phi/PI);
}

// float rand(vec3 r) { return fract(sin(dot(r.xy,vec2(1.38984*sin(r.z),1.13233*cos(r.z))))*653758.5453); }

float sdCappedTorus(in vec3 p, in vec2 sc, in float ra, in float rb){
  p.x = abs(p.x);
  float k = (sc.y*p.x>sc.x*p.y) ? dot(p.xy,sc) : length(p.xy);
  return sqrt( dot(p,p) + ra*ra - 2.0*ra*k ) - rb;
}

float sdBox( vec3 p, vec3 b ){
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float hash31( vec3 p ){
    return fract(sin(dot(p ,vec3(12.9898,78.233,91.495))) * 43758.5453);
}

mat3 rotate( in vec3 v, in float angle){
    float c = cos(angle);
    float s = sin(angle);
    
    return mat3(
        c + (1.0 - c) * v.x * v.x, (1.0 - c) * v.x * v.y - s * v.z, (1.0 - c) * v.x * v.z + s * v.y,
        (1.0 - c) * v.x * v.y + s * v.z, c + (1.0 - c) * v.y * v.y, (1.0 - c) * v.y * v.z - s * v.x,
        (1.0 - c) * v.x * v.z - s * v.y, (1.0 - c) * v.y * v.z + s * v.x, c + (1.0 - c) * v.z * v.z
    );
}

vec3 rotateOffset(in vec3 pos, in vec3 v, in float angle, in vec3 offset){
    return (pos - offset) * rotate(v, angle) + offset;
}

vec3 hsv(float cX, float cY, float cZ){
    cX -= float(int(cX));
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(vec3(cX) + K.xyz) * 6.0 - K.www);
    return cZ * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), cY);
}

float hash( float n ){
    return fract(sin(n)*758.5453);
}

const vec2 zOffset = vec2(37.0,17.0);
const vec2 wOffset = vec2(59.0,83.0);

vec4 texNoise(vec2 uv)   // Emulate a single texture fetch into the precalculated texture
{
    // NOTE: Precalculate texture, so we can do a single fetch instead of 4.
    // Afaik we can't generate a texture of a specific size in shadertoy at the momemt.
    float r = texture2D( rand, mod((uv+0.5)/256.0, 1.)).r;
    float g = texture2D( rand, mod((uv+0.5 + zOffset)/256.0, 1.)).r;
    float b = texture2D( rand, mod((uv+0.5 + wOffset)/256.0, 1.)).r;
    float a = texture2D( rand, mod((uv+0.5 + zOffset + wOffset)/256.0, 1.)).r;
    
    return vec4(r, g, b, a);
}


float noise4dFast( in vec4 x )
{
    vec4 p = floor(x);
    vec4 f = fract(x);
    f = f*f*(3.0-2.0*f);
    
    vec2 uv = (p.xy + p.z*zOffset + p.w*wOffset) + f.xy;
    
    vec4 s = texNoise(uv);
    return mix(mix( s.x, s.y, f.z ), mix(s.z, s.w, f.z), f.w);
}

// float sdGyroid(vec4 p) {
//     return (dot(sin(p.xyzw), cos(p.wyzx)) - sin(offset)) * .5;
// }

float sdGyroid(vec4 p) {
    return clamp(dot(sin(p.xyzw), cos(p.yzxw)) * .5, -1., 1.);
}

float sdGyroid(vec3 p, float offset) {
    return sdGyroid(vec4(p, offset));
}

float sdGyroid(vec3 p) {
    return sdGyroid(p, 0.0);
}

mat3 lookat( in vec3 fw, in vec3 up ){
    fw = normalize(fw);
    vec3 rt = normalize( cross(fw, normalize(up)) );
    return mat3( rt, cross(rt, fw), fw );
}

vec3 transformPos(vec3 pos){
    vec3 rotPos = vec3(pos);
    // if(HD){
    vec2 xy = vec2(1.,0.);
    rotPos -= rayOrigin;
    rotPos *= rotate(xy.xyy, twisty*(rotPos.y*0. + rotPos.x*.2) / cellWidth );
    rotPos *= rotate(xy.yxx, warpy*2.*.1*(rotPos.y + rotPos.z) / cellWidth) ;
    rotPos += rayOrigin;
// }
    return rotPos;
}

dObj mapDist(vec3 pos){
    const vec2 SC = vec2(sin(PI/4.), cos(PI/4.));
    const mat2 ROT = mat2(cos(PI/4.), sin(PI/4.), -sin(PI/4.), cos(PI/4.));
    const mat2 ROT2 = mat2(cos(PI/2.), sin(PI/2.), -sin(PI/2.), cos(PI/2.));
    const mat2 nROT = mat2(cos(PI/4.), -sin(PI/4.), sin(PI/4.), cos(PI/4.));

    vec3 rotPos = transformPos(pos);

    float posNoiseAmt = -.3*pow(sdGyroid(rotPos * 1.5, playTime*.06), 4.) * (sin(playTime/16.) + 1.1) ;
    // posNoiseAmt -= .2*pow(sdGyroid(rotPos * 10.*exp(sin(rotPos.x/100.)), playTime*.06), 4.);
    // posNoiseAmt += .015*pow(sdGyroid(.5*rotPos * exp(1.+sdGyroid(rotPos*.6)), playTime*.09), 1.);
    
     float n2G = sin(sdGyroid(rotPos/11.)/7.);
    float n3G = cos(sdGyroid(rotPos/14.)/11.);
    posNoiseAmt -= .03*pow(sdGyroid(rotPos * 7.*(1. + 1.*n2G), playTime*.086), 1.) ;
    
    
    // if(HD){
        // posNoiseAmt += -.2*pow(sdGyroid(rotPos * 3., playTime*.16), 6.) * (cos(playTime/17.) + 1.1) ;
        // posNoiseAmt += -.2*pow( sdGyroid((sdGyroid(rotPos*3.)*.1 + rotPos) * 1., playTime*.1), 6.) ;
    // }
    vec3 noisePos = rotPos + posNoiseAmt;

    float noisey =0.;
        // (pow(sdGyroid(noisePos/8., .2*playTime * 1.), 3.) - .0) / 2.;// + 
        
    if(HD){
       

        posNoiseAmt -= .4*pow(sdGyroid(rotPos * .5, playTime*.086), 1.) *sin(playTime/3.);
       // posNoiseAmt += (sdGyroid(sdGyroid(noisePos*2.*(1.+sin(noisePos.x/43.))) * noisePos/5., 0.*playTime/4.) - .25)/50.;
        posNoiseAmt += .001*pow(sdGyroid(rotPos * 60.*(1.5 + 1.*n3G), playTime*.086), 1.) ;
    //     // noisey += -.2*pow( sdGyroid((sdGyroid(rotPos)*.2 + rotPos) * 40., playTime*.16), 6.) * (cos(playTime/4.) + 1.1) * .0 ;
    //     // noisey += .2*pow(clamp(abs(sdGyroid(sdGyroid(noisePos*.1*(1.+sin(noisePos.x/34.)))*noisePos*10.) - .25)/200., 0., 1.), .8);
    }

    posNoiseAmt += .1;

    // noisey *= .0;
    // noisey -= 1.;

    vec3 basis = vec3(1., 0., 0.);

    // float cellWidth = 10.;
    float ra = cellWidth * .5;
    float rb = .5;

    vec3 p = cellWidth * (mod(rotPos / cellWidth + .5, 1.) - .5);
    // vec3 p = vec3(pos);

    float randRot =  floor(3. * 
        hash31(floor(rotPos / cellWidth + .5))
    );
    if(randRot < 1.){
        basis = basis.yxy;
    }
    else if(randRot < 2.){
        basis = basis.yyx;
    }
    // mat3 pRot = rotate(basis, PI/2. * (randRot + 4.*clamp(mod(iTime/3., 8.)-4., 0., 1.)));
    mat3 pRot = rotate(basis, PI/2. * randRot);
    p *= pRot;
    // p = pos;
    vec3 q;
    q = p;
    q.xy += vec2(-.5,.5) * cellWidth;
    q.xy *= ROT;
    // q = rotateOffset(q, basis, iTime, vec3(-.5,.5, 0.) * cellWidth);
    float A = sdCappedTorus( q, SC, ra, rb );

    q = p.xzy;
    q.xy += vec2(.5,.5) * cellWidth;
    q.xy *= nROT;
    float B = sdCappedTorus( q, SC, ra, rb );
    
    q = vec3(p.y, -p.z, p.x);
    q.xy += vec2(-.5,.5) * cellWidth;
    q.xy *= ROT;
    float C = sdCappedTorus( q, SC, ra, rb );

    // float B = 100.;
    // float C = 100.;

    float d = abs(min(A, min(B, C)) + noisey + posNoiseAmt);
    int obj = -1;

    // d /= (1. + 10.*abs(posNoiseAmt));
    if(HD){
        d *= .5;
    }
    // if(noisey + posNoiseAmt > .1){
    //     d *= .5;
    // }
    else{
        d *= .75;
    }

    // float D = sdCappedTorus( p , SC, ra, rb );

    // float d = min(D, 99999.);

    if(d < epsilon){
        obj = 1;
    }

    return dObj(d, obj);
}

void normal( inout Ray ray ){
 vec3 eps = vec3(0.01, 0.0, 0.0);
 vec3 p = ray.p;
 ray.n = normalize( vec3(
     mapDist(p+eps.xyy).d-mapDist(p-eps.xyy).d,
     mapDist(p+eps.yxy).d-mapDist(p-eps.yxy).d,
     mapDist(p+eps.yyx).d-mapDist(p-eps.yyx).d
 ) );
 // ray.n = vec3(1., 0., 0.);
}

void map(inout Ray ray, vec3 ro, vec3 rd){
    dObj disty = mapDist(ray.p);
    ray.d = disty.d;
    ray.obj = disty.obj;
}

Ray raymarch( in vec3 ro, in vec3 rd){
    const int maxSteps = 80;
    float maxDist = 500.;
    Ray ray = Ray(
        ro, 
        -1,
        100000.,
        vec4(0.),
        vec3(0., 1., 0.)
    );
    float t = 0.;
    vec3 roN = vec3(ro);
    vec3 rdN = vec3(rd);
    for(int i=0; i<maxSteps; i++){
        if(HD || mod(float(i), 2.) == 0.){
            map(ray, roN, rdN);
            t += ray.d;
            ray.p += rdN * ray.d;  
            if( ray.d < epsilon || t > maxDist){
                break;
            }
        }
    }

    if(ray.obj > 0){
        normal(ray);
    }

    return ray;
}

void shade(inout Ray ray, in vec3 rd, in vec3 ro){
    vec3 reflected=reflect(rd,ray.n);
    vec4 hdri = texture2D(HDRI, revSpherical(reflected));
    // vec3 env=vec3(texture2D(HDRI,reflected*reflected*reflected).x);

    vec2 sph = revSpherical(ray.p - vec3(rayPos, 0, 0));

    // vec3 ldir1 = 3. * vec3(sin(iTime/3.), 1., cos(iTime/3.));
    float fog = clamp(1.-sigmoid(length(ray.p-ro)/1.4 - 30. - 50. * pow(lmh[1], 4.)), 0., 1.);
    vec4 fogColor = vec4(hsv(
        .3 + hueShift + sin(sph.y*.2) + 1., 
        .45 - .35*cos(playTime*2. * PI / 84.), 
        .5 + lmh[2] - .05*(cos(playTime*2. * PI / 128.) + 1.) / 2.
    ), 1.);

    vec2 uv = gl_FragCoord.xy/iResolution.xy; 
    fogColor.rgb *= clamp(2.5-4.*length(uv-vec2(.5)), 0., 1.);

    float hue = abs(dot(normalize(rd), normalize(ray.n)));
    vec4 thinFilm = vec4(hsv(hue/2. + hueShift, .9, hdri.r), 1.);
    
    if(ray.obj == 1){
        vec3 rotPos = transformPos(ray.p);
        float spots = 
        clamp(
            pow(
                abs(sdGyroid(
                    rotPos*9.*
                    (1. + .3*sin(rotPos.x/cellWidth/8.2))*.5*
                    // sigmoid(length(rotPos.yz - vec2(cellWidth/2.)))*
                    (1. + .1*sin(rotPos.x/cellWidth/9.2) ) * .5 *
                    (1. + .1*sin(playTime*.012)+.5)
                ) + .7*(.5+.2*cos(rotPos.x/cellWidth/5.2)))* 
                (1.5 + .4*sin(rotPos.x/cellWidth/10.2))
            , 200. )
        , 0., 1. );

        // spots *= 0.;
        spots *= pow(2.-sigmoid(length(rotPos.yz-rayOrigin.yz)/50.)*2., 4.);
        spots += .2;

        // spots += 1. - 
        // clamp(
        //     pow(
        //         abs(sdGyroid(
        //             ray.p*2.*
        //             sigmoid(length(ray.p.yz - vec2(cellWidth/2.)))*
        //             (1. + sin(ray.p.x/200.) ) * .5 *
        //             (1. + .1*sin(playTime*.003)+.5)
        //         ) - .2)*10.
        //     , 120. )
        // , 0., 1. );
        ray.col = 
            15. * mix(thinFilm, hdri, hue) * pow(lmh[0], 6.) * fog * (1. - spots) + 
            fogColor * (1. - fog) +
            vec4(hsv(ray.p.x / 180., clamp(abs(20. - ray.p.x)/20., 0., 1.)*.0*(1.-pow(lmh[0], 2.)),
                spots * pow(fog, .2) * .9 * (1.-pow(lmh[0], 4.)) 
            ), 1.);
        // ray.col = vec4(1.);
    }
    else{
        ray.col = fogColor;
    }
}

vec4 render(vec2 q){
    vec2 v = -1.0 + 2.0*q;
    v.x *= iResolution.x/iResolution.y;

    //Camera Settings
    // float fisheye = 6. * (sin(iTime / 5. + PI)) / 2.;
    // fisheye = .3;
    float lens = 1.9 + fisheye * length(v);

    //camera ray
    float camDist = 100.;
    float camFreq = 9999999.;
    // vec3 rayOrigin = camDist * vec3(1., 0., 0.);// * vec3(sin(iTime/15.), 0., cos(iTime/15.));
    // rayOrigin = vec3(iTime*3., cellWidth/2., cellWidth/2.);
    rayOrigin = vec3(
        rayPos, 
        cellWidth/2. + rayHeight * cellWidth, 
        cellWidth/2.
    );
    
    vec3 rayDir = normalize( vec3(v.x, v.y, lens) );
    vec3 target = vec3(0., cellWidth/2., cellWidth/2.);
    target = vec3(rayPos + targetDist, cellWidth/2., cellWidth/2.);
    // target = vec3(iTime*3. + 3., cellWidth/2. + sin(iTime * PI / 3.), cellWidth/2.);
    rayDir = lookat( target-rayOrigin, vec3(0.,upDir))*rayDir;
    
    //classic raymarching by distance field
    Ray ray = raymarch(rayOrigin, rayDir);
    shade(ray, rayDir, rayOrigin);
    return ray.col;
}

void main(){
    vec2 p = gl_FragCoord.xy/iResolution.xy; 
    vec4 col = render(p);

    // col = texture2D(HDRI, p);

    // col.rgb *= clamp(2.5-4.*length(p-vec2(.5)), 0., 1.);
        
    gl_FragColor = col;
}