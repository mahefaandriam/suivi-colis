import { Button } from "./ui/button";
import { Play, Sparkles, Rocket, Brain, Heart } from "lucide-react";
import { Badge } from "./ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 py-20">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80" 
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/80 via-purple-600/80 to-pink-500/80"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-pink-300 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-20 left-32 w-24 h-24 bg-blue-300 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-green-300 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}></div>
        
        {/* Stars */}
        <Sparkles className="absolute top-20 right-32 w-8 h-8 text-yellow-200 opacity-60 animate-pulse" />
        <Sparkles className="absolute bottom-32 left-20 w-6 h-6 text-yellow-200 opacity-60 animate-pulse" style={{ animationDelay: '1s' }} />
        <Sparkles className="absolute top-40 left-1/3 w-7 h-7 text-yellow-200 opacity-60 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Badge className="bg-yellow-400 text-gray-900 hover:bg-yellow-400 mb-6 px-4 py-2">
            <Rocket className="w-4 h-4 mr-2 inline" />
            Fun Learning for Everyone!
          </Badge>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 text-white">
            Learn, Play, and Grow!
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Discover amazing educational videos that make learning super fun! Join thousands of kids exploring science, math, history, and more!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg shadow-xl"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Watching
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
            >
              Explore Subjects
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-center mb-2">
                <Brain className="w-8 h-8 text-yellow-300" />
              </div>
              <div className="text-3xl text-white mb-1">500+</div>
              <div className="text-sm text-white/80">Fun Videos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-center mb-2">
                <Heart className="w-8 h-8 text-pink-300" />
              </div>
              <div className="text-3xl text-white mb-1">50K+</div>
              <div className="text-sm text-white/80">Happy Students</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="w-8 h-8 text-blue-300" />
              </div>
              <div className="text-3xl text-white mb-1">100%</div>
              <div className="text-sm text-white/80">Fun & Safe</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="rgb(249 250 251)" fillOpacity="1"/>
        </svg>
      </div>
    </section>
  );
}