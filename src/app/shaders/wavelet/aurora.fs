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

const float PI = 3.14159265359;

uniform float iTime;
uniform sampler2D iChannel0;
uniform sampler2D iWavelet;
uniform vec3 lmh;
uniform vec2 iResolution;
uniform bool HD;

uniform float fisheye;
uniform float camDist;
uniform vec2 rayOriginC;
uniform vec2 rayUp;
uniform vec2 rayOriginOffset;
uniform float hueShift;
uniform float skyHeight;
uniform float uvDisp;
uniform float camKal;
uniform float camSin;
uniform float renderDist;
uniform float ballX;
uniform float ballY;
uniform vec2 moonXY;
uniform float moonLight;

vec3 cen1;// = vec3(0., -skyHeight/2. * sin(iTime*2.), 0.);
// vec3 cen1 = -vec3(0., skyHeight/2., 0.);
float rad1;// = skyHeight/2.;
vec3 cen2;//= cen1 + skyHeight * vec3(sin(iTime*2.), 0., cos(iTime*2.));

float hash21(in vec2 n){ return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }


vec3 hsv(float cX, float cY, float cZ){
    cX -= float(int(cX));
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(vec3(cX) + K.xyz) * 6.0 - K.www);
    return cZ * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), cY);
}

//iq 3d noise
float noise(vec3 x){
    vec3 f = fract(x);
    vec3 p = x - f;
    f = f*f*(3.0 - 2.0*f);
    vec2 uv = (p.xy + vec2(37.0, 17.0) * p.z) + f.xy;
    vec2 rg = texture2D(iChannel0, (uv + 0.5)/256.0, -100.0).rg;
    return mix(rg.y, rg.x, f.z);
}

float fbm(vec3 x){
    float r = 0.0;
    float w = 1.0, s = 1.0;
    for (int i=0; i<5; i++)
    {
        w *= 0.5;
        s *= 2.0;
        r += w * noise(s * x);
    }
    return r;
}

mat3 lookat( in vec3 fw, in vec3 up ){
	fw = normalize(fw);
	vec3 rt = normalize( cross(fw, normalize(up)) );
	return mat3( rt, cross(rt, fw), fw );
}

float thetaMap(float theta, float split){
	float thetaMod = mod(theta, 2. * PI);
	float splitMod = mod(split, 2. * PI);
	if(thetaMod > splitMod){
		thetaMod -= 2. * PI;
	}
	return thetaMod;
}

vec4 raySphere(vec3 start, vec3 end, vec3 cen, float r){
	float a = pow(end.x - start.x, 2.) + pow(end.y - start.y, 2.) + pow(end.z - start.z, 2.);
	float b = -2. * ( (end.x-start.x)*(cen.x-start.x) + (end.y-start.y)*(cen.y-start.y) + (end.z-start.z)*(cen.z-start.z) );
	float c = pow(cen.x - start.x, 2.) + pow(cen.y - start.y, 2.) + pow(cen.z - start.z, 2.) - pow(r, 2.);
	float d = pow(b, 2.) - 4. * a * c;
	if(d > 0.){
		float t1 = (-b - sqrt(d)) / (2. * a);
		float t2 = (-b + sqrt(d)) / (2. * a);
		float t = t1 > -.01 ? t1 : t2;
		t = t1;
		if(t > -.01){
			return vec4(1., 
				start.x + (start.x - end.x) * t,
				start.y + (start.y - end.y) * t,
				start.z + (start.z - end.z) * t
			);
		}
	}
	return vec4(-1.);
}

dObj mapDistAurora(vec3 pos, vec3 ro, vec3 rd){
	float ep = .0000001;
	float d = (skyHeight - pos.y + ep) / (rd.y + ep);//+ .01);
	int obj = -1;

	vec4 intSphere1 = raySphere(pos, rd + pos, cen1, rad1);
	vec4 intSphere2 = raySphere(pos, rd + pos, cen2, rad1/2.);
	float A = length(pos - intSphere1.gba);
	float B = length(pos - intSphere2.gba);


	if(length(pos - ro) > 0. && rd.y > 0.){
		// d = .001 + hash21(gl_FragCoord.xy)*.005;
		float distMult = HD ? 1. : 2.;
		d = .024 * distMult * (1. + (pos.y - skyHeight + ep) / (rd.y + ep));
		obj = 1;
	}
	else if(rd.y < 0.){
		d = (-skyHeight - pos.y + ep) / (rd.y + ep);
		// d /= 2.;
		// d = abs(d);
		obj = 2;
	}


	if(intSphere1.x > 0. && intSphere2.x > 0. && min(A, B) < d){
		obj = 4;
		if(A > B){
			obj = 5;
		}
		return dObj(min(A, B), obj);
	}
	else if(intSphere1.x > 0. && A < d){
		obj = 4;
		return dObj(A, obj);
	}
	else if(intSphere2.x > 0. && B < d){
		obj = 5;
		return dObj(B, obj);
	}

	return dObj(d, obj);
}

void mapAurora(inout Ray ray, vec3 ro, vec3 rd){
	// vec3 offset = vec3(sin(iTime/1.22), 0., cos(iTime/1.44));
	dObj mapAurora = mapDistAurora(ray.p, ro, rd);
	ray.d = mapAurora.d;
	ray.obj = mapAurora.obj;

	if(ray.obj == 1){
		float grad = .45 + .7 * (ray.p.y - skyHeight);
		vec3 rgb = hsv(grad * .75 + hueShift, .85, 1.);
		vec2 uvWav = mod(ray.p.zx / 30. + .5 + vec2(0., uvDisp), 1.);
		float wNoise = texture2D(iWavelet, uvWav).r / 4.;
		if(length(uvWav - .5) > .5){
			wNoise *= 0.;
		}
		if(!HD){
			wNoise /= .7;
		}
		if(max(abs(ray.p.z), abs(ray.p.x)) < renderDist){
			ray.col += vec4(rgb, 1.) * pow(wNoise, 2.) * pow(clamp(grad, 0., 1.), .5) * .8;
		}
	}
}

// void normal( inout Ray ray ){
// 	vec3 eps = vec3(0.001, 0.0, 0.0);
// 	vec3 p = ray.p;
// 	ray.n = normalize( vec3(
// 		mapDist(p+eps.xyy).d-mapDist(p-eps.xyy).d,
// 		mapDist(p+eps.yxy).d-mapDist(p-eps.yxy).d,
// 		mapDist(p+eps.yyx).d-mapDist(p-eps.yyx).d
// 	) );
// }

vec2 noiseNormal(vec2 p){
	vec2 ep = vec2(.01, 0.);
	float zPos = iTime/100.;
	float nFreq = 1. * .05 * sin(iTime / 60.);
	nFreq = 1.;
	float dX = fbm(vec3((p + ep.xy)  * nFreq, zPos)) - 
		fbm(vec3((p - ep.xy)  * nFreq, zPos));
	float dY = fbm(vec3((p + ep.yx)  * nFreq, zPos)) - 
		fbm(vec3((p - ep.yx)  * nFreq, zPos));
	return vec2(dX, dY) * (1.25 + sin(iTime / 40.) * .75) ;
}

Ray raymarch( in vec3 ro, in vec3 rd){
    const int maxSteps = 24;
    float maxDist = 100.;
    float epsilon = 0.001;
	Ray ray = Ray(
        ro, 
        -1,
        100.,
        vec4(0.),
        vec3(0., 1., 0.)
    );
	float t = 0.;
	vec3 roN = vec3(ro);
	vec3 rdN = normalize(vec3(rd));
	for(int i=0; i<maxSteps; i++){
		if(HD || mod(float(i), 2.) == 0.){
	        mapAurora(ray, roN, rdN);
	        t += ray.d;
	        ray.p += rdN * ray.d;  
			if( ray.d < epsilon){//} || t > maxDist){
	            break;
			}
			if(ray.obj == 2){
				vec2 noiseNorm = .7 * noiseNormal(ray.p.xz / 8. + vec2(0., uvDisp));
				roN = vec3(ray.p);
				rdN = reflect(rdN, normalize(vec3(noiseNorm.x, 1.0, noiseNorm.y)));
			}
			else if(ray.obj == 4){//} && length(ray.p - cen1) < rad1 * 2.){
				roN = vec3(ray.p);
				rdN = reflect(rdN, normalize(ray.p-cen1));
			}
			else if(ray.obj == 5){
				roN = vec3(ray.p);
			}
		}
	}

	// if(ray.d < epsilon){
	// 	normal(ray);
	// }
	// else{
	// 	ray.obj = -1;
	// }
	
	return ray;
}

void shade(inout Ray ray, in vec3 rd){
	vec3 ldir1 = 3. * vec3(sin(iTime/3.), 1., cos(iTime/3.));
	if(ray.obj == 0){
		// float roughness = .1;
		// ray.col += vec4(.9 * (1.-ray.col.a), 0., 0., 1.);
		// vec3 refl = reflect(rd, ray.n);  
  //       float spec = pow(clamp( dot( refl, ldir1 ), 0.0, 1.0 ), 1./roughness);
		// ray.col += .7 * spec * (1.-ray.col.a);
		ray.col = vec4(1., 0., 0., 1.);
	}
	// else if(ray.obj == 4){
	// 	ray.col += vec4(vec3(.8), 1.);
	// }
	else if(ray.obj == 5){
		ray.col += vec4(vec3(moonLight), 1.);
	}
	else{
		// ray.col = vec4(1.) - ray.col;
	}

	// if(ray.obj == 1){
	// 	ray.col = vec4(1.);
	// }
}

vec4 render(vec2 q){
	vec2 v = -1.0 + 2.0*q;
	v.x *= iResolution.x/iResolution.y;

	float theta = thetaMap(atan(v.y, v.x), 3. * PI / 2.) ;
	float rad = length(v);

	// theta -= PI / 3. * camSin;
	theta *= camKal;
	theta -= 2. * PI * (camKal - 1.) / 4.;

	v = rad * vec2(cos(theta), sin(theta));

    //Camera Settings
    // float fisheye = fisheye;
    float lens = 1.9 - fisheye * length(v);

	//camera ray
    // float camDist = ;
    float camFreq = 9999999.;
    vec3 rayOrigin = camDist * vec3(rayOriginC.x, 0., rayOriginC.y) + 
    	vec3(rayOriginOffset.x, 0., rayOriginOffset.y);
	vec3 rayDir = normalize( vec3(v.x, v.y, lens) );
    vec3 target = vec3(0.0, 0., 0.0);
	rayDir = lookat( target-rayOrigin, vec3(0.,rayUp))*rayDir;
    
	//classic raymarching by distance field
	Ray ray = raymarch(rayOrigin, rayDir);
	shade(ray, rayDir);
    return ray.col;
}

void main()
{
	cen1 = vec3(ballX, -skyHeight/2. * ballY, 0.);
	// vec3 cen1 = -vec3(0., skyHeight/2., 0.);
	rad1 = skyHeight/2.;
	cen2 = cen1 + skyHeight * vec3(moonXY.x, 0., moonXY.y);

    vec2 p = gl_FragCoord.xy/iResolution.xy;
    vec4 col = render(p);
        
	gl_FragColor = col;
}