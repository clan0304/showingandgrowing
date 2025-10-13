import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Camera, Briefcase, Users, Zap, MapPin, Heart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-primary/5">
        <div className="container mx-auto px-4 py-20 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Where Creators & Businesses{' '}
              <span className="text-primary">Grow Together</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect local content creators with restaurants, cafes, and
              businesses for authentic collaborations that benefit everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/sign-in">
                <Button size="lg" className="text-lg px-8 py-6">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/creators">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                >
                  Browse Creators
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-gray-600">Free to Join</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">Local</div>
              <div className="text-gray-600">In-Person Connections</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">Easy</div>
              <div className="text-gray-600">Simple Setup</div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Growing Together Through Connection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We believe in the power of local collaboration. When creators and
              businesses connect, magic happens.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Authentic Growth</CardTitle>
                <CardDescription className="text-base">
                  Build genuine relationships that lead to long-term success for
                  both parties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>
                      Creators gain real-world experience and exposure
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>
                      Businesses reach engaged local audiences authentically
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>
                      Community-driven collaborations that feel natural
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Win-Win Partnerships</CardTitle>
                <CardDescription className="text-base">
                  Every connection creates value on both sides of the
                  marketplace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Creators build their portfolio and network</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>
                      Businesses get quality content from local talent
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Both grow their presence in the community</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works - Two Columns */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple. Fast. Effective.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting started is easy. Just a few steps to begin connecting and
              growing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* For Creators */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">
                  For Creators
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-2">
                      Create Your Profile
                    </h4>
                    <p className="text-gray-600">
                      Upload your portfolio, add your bio, and link your social
                      media. Show businesses what you can do.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-2">
                      Browse Opportunities
                    </h4>
                    <p className="text-gray-600">
                      Find local businesses looking for content creators. Filter
                      by location and dates that work for you.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-2">
                      Apply & Connect
                    </h4>
                    <p className="text-gray-600">
                      One-click applications. Businesses reach out via your
                      social media to discuss the opportunity.
                    </p>
                  </div>
                </div>

                <Link href="/sign-in">
                  <Button size="lg" className="w-full mt-4">
                    Start as a Creator
                  </Button>
                </Link>
              </div>
            </div>

            {/* For Businesses */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">
                  For Businesses
                </h3>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-2">
                      Set Up Your Account
                    </h4>
                    <p className="text-gray-600">
                      Quick signup process. Add your business details and
                      you&apos;re ready to find creators.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-2">
                      Post Your Job
                    </h4>
                    <p className="text-gray-600">
                      Describe your content needs, set the date and location,
                      and publish. It takes just minutes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-2">
                      Review & Connect
                    </h4>
                    <p className="text-gray-600">
                      Browse creator profiles, review applications, and reach
                      out to the perfect match for your business.
                    </p>
                  </div>
                </div>

                <Link href="/sign-in">
                  <Button size="lg" variant="outline" className="w-full mt-4">
                    Start as a Business
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose CreatorHub?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Local Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect with creators and businesses in your area for genuine
                  in-person collaborations.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Quick Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get started in minutes. Upload your profile or post a job and
                  start connecting right away.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Community Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Built for real people and real businesses. No corporate
                  middlemen, just authentic connections.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Ready to Start Growing?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join CreatorHub today and discover the power of local
              collaboration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-in">
                <Button size="lg" className="text-lg px-8 py-6">
                  <Camera className="w-5 h-5 mr-2" />
                  Join as Creator
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  Join as Business
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              No credit card required. Get started for free.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">CreatorHub</h3>
              <p className="text-gray-400">
                Connecting creators and businesses for authentic local
                collaborations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Creators</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/creators" className="hover:text-white">
                    Browse Creators
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className="hover:text-white">
                    Find Jobs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Businesses</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link href="/creators" className="hover:text-white">
                    Find Creators
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 ShowingandGrowing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
