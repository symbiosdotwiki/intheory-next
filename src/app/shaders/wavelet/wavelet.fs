precision highp float;

uniform vec2 iResolution;
uniform sampler2D iAudioData;
uniform float iTime;
uniform bool HD;

uniform float thetaScale;


// Try these for more or less fun:
#define REFLECT 
#define RADIAL 
#define SCALE_ON_MOUSE_X

// Iain Melvin 2014, Isomov 2019

const float PI = 3.141592653589;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 hsv2rgb(float h, float s, float v) {
	return hsv2rgb(vec3(h, s, v));
}


void main()
{
    // create pixel coordinates
    vec2 uv = gl_FragCoord.xy / iResolution.xy;

    #ifdef REFLECT
    	uv = abs( uv * 2.0 - vec2(1.) );
    #endif

    // #ifdef SCALE_ON_MOUSE_X
    //     uv *= 1.0 - min( 0.9, iMouse.x/iResolution.x );
    // #endif
	
    #ifdef RADIAL
        float theta = thetaScale * atan(uv.x, uv.y);
        float r = length(uv);
        uv = vec2(theta,r);	
    #endif	
	
    // first texture2D row is frequency data
    float fft  = texture2D( iAudioData, vec2(.01, uv.x) ).x;

    // second texture2D row is the sound wave
    //float wave = texture2D( iAudioData, vec2(.99, uv.x) ).x;

    // my wavelet 
    float base = 3.;// + sin(iTime / 1.);
    float width = 1.0 - pow(uv.y, 1.0 / base );
    float numPer = 3.;
    const int numSteps = 150;
    const float stepSize = 1.0 / float(numSteps);

    float yr = 0.0;
    float accr = 0.0;
    float accn = 0.0;

    float i = 0.;
   
    for (float x = -1.0; x < 1.0; x += stepSize){
		
		if(HD || mod(i, 2.) == 0.){
	        // the wave in the wavelet
	        float freq = 2.*PI * numPer;
	        float yWave = sin( freq * ( 2.*uv.x + x ) ); 

	        // get a sample - center at uv.x, offset by width*x
	        float xSound = uv.x + width*x;
	        
	        float ySound = texture2D( iAudioData, vec2(.99, xSound)).x; 

	        // remap sample to [-1, 1]
	        ySound = 2. * (ySound - 0.5);

	        // multiply with the wave in the wavelet
	        float yMult = yWave * ySound;

	        // apply packet 'window'
	        float w =  0.5 * (1.0 - sin( PI * (x + 1.5)));
	        //float w = 1.0-abs(x); //faster
	        yMult *= w;

	        // accumulate
	        accr += yMult;
	        accn += w * abs(yWave);
	    }
        i += 1.;

    }

    float y = 30.0 * abs(accr)/float(accn);
    
    vec3 col = vec3(0,0,0);
    if (uv.y < 0.0){
        // chrome fft
        col += vec3(fft);
    }
    else{
        y=clamp(y,0.0,1.0);
        vec3 outCol = hsv2rgb(y/2.+.3+iTime/20., .65, .85);
        col += outCol;
    }
	
    // add wave form on top     
    //col += 1.0 -  smoothstep( 0.0, 0.01, abs(wave - uv.y) );

    // output final color
    y = pow(y, 2.);
    gl_FragColor = vec4(y,y,y,1.0);
    
}
