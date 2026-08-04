import { api } from "./api";

export const customerService = {
  getProfile: async () => {
    try {
      const response = await api.get("/user/profile");
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (err) {
      console.warn("Could not fetch user profile from backend:", err);
      return null;
    }
  },

  updateProfile: async (profileData: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    avatar?: string;
    bio?: string;
  }) => {
    try {
      const response = await api.patch("/user/profile", profileData);
      return response.data;
    } catch (err: any) {
      console.error("Profile update backend API error:", err);
      throw err;
    }
  },

  getDashboardData: async () => {
    return {
      user: { name: "Rahul", location: "Bhopal, Madhya Pradesh" },
      upcomingBooking: {
        id: "B-1234",
        service: "AC Repair & Service",
        provider: "CoolCare Experts",
        date: "24 May 2024",
        time: "10:00 AM",
        status: "Confirmed"
      },
      categories: [
        { name: "Electrical", icon: "Zap", color: "text-emerald-500", bg: "bg-emerald-50" },
        { name: "Plumbing", icon: "Droplets", color: "text-blue-500", bg: "bg-blue-50" },
        { name: "Cleaning", icon: "Sparkles", color: "text-pink-500", bg: "bg-pink-50" },
        { name: "Carpentry", icon: "Hammer", color: "text-orange-500", bg: "bg-orange-50" },
        { name: "Painting", icon: "Paintbrush", color: "text-purple-500", bg: "bg-purple-50" },
        { name: "Appliance", icon: "Wrench", color: "text-teal-500", bg: "bg-teal-50" },
      ],
      popularServices: [
        {
          id: 1,
          title: "AC Repair & Service",
          category: "Appliance Repair",
          price: 499,
          provider: "CoolCare Experts",
          rating: 4.7,
          reviews: 128,
          distance: "1.2 km",
          time: "60 - 90 mins",
          image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80",
          images: [
            "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
            "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&q=80",
            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
            "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80"
          ]
        },
        {
          id: 2,
          title: "Plumbing Services",
          category: "Plumbing",
          price: 299,
          provider: "QuickFix Plumbing",
          rating: 4.6,
          reviews: 96,
          distance: "1.5 km",
          time: "45 - 60 mins",
          image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&q=80",
          images: [
            "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
            "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80",
            "https://images.unsplash.com/photo-1505798577917-a65157d3320a?w=800&q=80",
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80"
          ]
        }
      ]
    };
  }
};