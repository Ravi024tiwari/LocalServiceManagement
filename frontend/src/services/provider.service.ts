export const providerService = {
  getDashboardData: async () => {
    // In production: return await api.get("/provider/dashboard");
    return {
      user: { 
        name: "Rahul", 
        fullName: "Rahul Sharma",
        location: "Bhopal, Madhya Pradesh",
        status: "Verified Provider",
        isOnline: true
      },
      stats: {
        totalServices: { value: 12, trend: "Active Services", isPositive: true },
        activeBookings: { value: 18, trend: "+4 from yesterday", isPositive: true },
        completedBookings: { value: 324, trend: "+12 this week", isPositive: true },
        totalEarnings: { value: "₹48,560", trend: "+18% this month", isPositive: true },
        averageRating: { value: 4.8, trend: "(128 reviews)", isPositive: true }
      },
      todaysBookings: [
        { id: 1, time: "11:30 AM", service: "AC Repair & Service", customer: "Rahul Verma", status: "Confirmed" },
        { id: 2, time: "01:00 PM", service: "Plumbing Service", customer: "Sneha Patel", status: "Pending" },
        { id: 3, time: "04:30 PM", service: "Home Cleaning", customer: "Amit Sharma", status: "Confirmed" },
        { id: 4, time: "06:00 PM", service: "Electrical Work", customer: "Vikram Singh", status: "Pending" }
      ],
      myServices: [
        { id: 1, title: "AC Repair & Service", category: "Appliance Repair", price: 499, bookings: 124, rating: 4.8, reviews: 92, status: "Active", image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80" },
        { id: 2, title: "Plumbing Services", category: "Plumbing", price: 299, bookings: 98, rating: 4.7, reviews: 76, status: "Active", image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&q=80" },
        { id: 3, title: "Home Cleaning", category: "Cleaning", price: 399, bookings: 156, rating: 4.9, reviews: 128, status: "Active", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80" },
        { id: 4, title: "Electrical Work", category: "Electrical", price: 199, bookings: 112, rating: 4.6, reviews: 64, status: "Active", image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80" }
      ]
    };
  }
};