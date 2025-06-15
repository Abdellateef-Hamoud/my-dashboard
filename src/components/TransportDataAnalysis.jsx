import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, Car, MapPin, CreditCard, Star, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

const TransportDataAnalysis = () => {
  const [data, setData] = useState({
    users: [],
    trips: [],
    bookings: [],
    payments: [],
    stations: [],
    ratings: [],
    routes: [],
    cars: [],
    tickets: [],
    userTrips: [],
  });

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const files = {
        users: 'Users.csv',
        trips: 'Trips.csv',
        bookings: 'Bookings.csv',
        payments: 'Payments.csv',
        stations: 'Stations.csv',
        ratings: 'Ratings.csv',
        routes: 'Routes.csv',
        cars: 'Cars.csv',
        tickets: 'Tickets.csv',
        userTrips: 'UserTrips.csv',
      };

      const loadedData = {};

      for (const [key, filename] of Object.entries(files)) {
        try {
          const fileContent = await fetch('/' + filename).then((r) => r.text());
          const parsed = Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
          });
          loadedData[key] = parsed.data;
        } catch (error) {
          console.error(`Error loading ${filename}:`, error);
          loadedData[key] = [];
        }
      }

      setData(loadedData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // تحليل الإحصائيات الأساسية
  const getOverviewStats = () => {
    const totalUsers = data.users.length;
    const drivers = data.users.filter((u) => u.UserType === 1).length;
    const passengers = data.users.filter((u) => u.UserType === 2).length;
    const totalTrips = data.trips.length;
    const totalBookings = data.bookings.length;
    const totalRevenue = data.payments.reduce((sum, p) => sum + (p.Amount || 0), 0);
    const avgRating =
      data.ratings.reduce((sum, r) => sum + (r.RatingValue || 0), 0) / data.ratings.length || 0;

    return {
      totalUsers,
      drivers,
      passengers,
      totalTrips,
      totalBookings,
      totalRevenue,
      avgRating: avgRating.toFixed(1),
    };
  };

  // تحليل الحجوزات حسب الرحلة
  const getBookingsByTrip = () => {
    const bookingCounts = {};
    data.bookings.forEach((booking) => {
      const tripId = booking.TripId;
      bookingCounts[tripId] = (bookingCounts[tripId] || 0) + 1;
    });

    return Object.entries(bookingCounts).map(([tripId, count]) => ({
      tripId: `رحلة ${tripId}`,
      bookings: count,
    }));
  };

  // تحليل الإيرادات حسب الطريق
  const getRevenueByRoute = () => {
    const routeRevenue = {};

    data.payments.forEach((payment) => {
      const ticket = data.tickets.find((t) => t.Id === payment.TicketId);
      if (ticket) {
        const booking = data.bookings.find((b) => b.Id === ticket.BookingId);
        if (booking) {
          const trip = data.trips.find((t) => t.TripId === booking.TripId);
          if (trip) {
            const route = data.routes.find((r) => r.RouteId === trip.RouteId);
            if (route) {
              const startStation = data.stations.find((s) => s.Id === route.StartStationId);
              const endStation = data.stations.find((s) => s.Id === route.EndStationId);
              const routeName = `${startStation?.Name || 'غير محدد'} - ${
                endStation?.Name || 'غير محدد'
              }`;
              routeRevenue[routeName] = (routeRevenue[routeName] || 0) + (payment.Amount || 0);
            }
          }
        }
      }
    });

    return Object.entries(routeRevenue).map(([route, revenue]) => ({
      route,
      revenue,
    }));
  };

  // تحليل التقييمات حسب السائق
  const getRatingsByDriver = () => {
    const driverRatings = {};

    data.ratings.forEach((rating) => {
      const driver = data.users.find((u) => u.Id === rating.DriverId);
      const driverName = driver ? `${driver.FName} ${driver.LName}` : `سائق ${rating.DriverId}`;

      if (!driverRatings[driverName]) {
        driverRatings[driverName] = [];
      }
      driverRatings[driverName].push(rating.RatingValue || 0);
    });

    return Object.entries(driverRatings).map(([driver, ratings]) => ({
      driver,
      avgRating: (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1),
      totalRatings: ratings.length,
    }));
  };

  // تحليل حالة المدفوعات
  const getPaymentStatus = () => {
    const statusCounts = {};
    data.payments.forEach((payment) => {
      const status = payment.PaymentStatus || 'غير محدد';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  };

  const stats = getOverviewStats();
  const bookingsByTrip = getBookingsByTrip();
  const revenueByRoute = getRevenueByRoute();
  const ratingsByDriver = getRatingsByDriver();
  const paymentStatus = getPaymentStatus();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div
      className="rounded-lg shadow-md p-6"
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: color === 'blue' ? '#4A90E2' : color === 'green' ? '#50E3C2' : color === 'yellow' ? '#F5A623' : '#9B59B6',
        backgroundColor: color === 'blue' ? '#4A90E2' : color === 'green' ? '#50E3C2' : color === 'yellow' ? '#F5A623' : '#9B59B6',
      }}
    >
      <div className="flex items-center">
        <div
          className="p-3 rounded-full"
          style={{
            backgroundColor: color === 'blue' ? 'rgba(74, 144, 226, 0.2)' : color === 'green' ? 'rgba(80, 227, 194, 0.2)' : color === 'yellow' ? 'rgba(245, 166, 35, 0.2)' : 'rgba(155, 89, 182, 0.2)',
          }}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 text-white">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-sm">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">تحليل بيانات نظام النقل والحجز</h1>

        {/* التبويبات */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'نظرة عامة', icon: TrendingUp },
                { id: 'bookings', name: 'الحجوزات', icon: Calendar },
                { id: 'payments', name: 'المدفوعات', icon: CreditCard },
                { id: 'ratings', name: 'التقييمات', icon: Star },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* المحتوى حسب التبويب */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* الإحصائيات الأساسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Users}
                title="إجمالي المستخدمين"
                value={stats.totalUsers}
                subtitle={`${stats.drivers} سائق، ${stats.passengers} راكب`}
                color="blue"
              />
              <StatCard
                icon={Car}
                title="إجمالي الرحلات"
                value={stats.totalTrips}
                subtitle="رحلة مجدولة"
                color="green"
              />
              <StatCard
                icon={CreditCard}
                title="إجمالي الإيرادات"
                value={`${stats.totalRevenue} جنيه`}
                subtitle={`من ${stats.totalBookings} حجز`}
                color="yellow"
              />
              <StatCard
                icon={Star}
                title="متوسط التقييم"
                value={stats.avgRating}
                subtitle={`من ${data.ratings.length} تقييم`}
                color="purple"
              />
            </div>

            {/* الإيرادات حسب الطريق */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">الإيرادات حسب الطريق</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByRoute}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="route" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} جنيه`, 'الإيرادات']} />
                  <Bar dataKey="revenue" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-8">
            {/* الحجوزات حسب الرحلة */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">الحجوزات حسب الرحلة</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={bookingsByTrip}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tripId" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* جدول تفاصيل الحجوزات */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">تفاصيل الحجوزات الحديثة</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم الحجز
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم الراكب
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم الرحلة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        رقم المقعد
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        الحالة
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.bookings.slice(0, 10).map((booking) => (
                      <tr key={booking.Id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.Id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.PassengerId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.TripId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.SeatNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              booking.Status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {booking.Status === 1 ? 'مؤكد' : 'ملغي'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-8">
            {/* حالة المدفوعات */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">حالة المدفوعات</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* إحصائيات المدفوعات */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">إجمالي المدفوعات</h3>
                <p className="text-3xl font-bold text-green-600">{data.payments.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">المدفوعات المكتملة</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {data.payments.filter((p) => p.PaymentStatus === 'مكتمل').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">المدفوعات المعلقة</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {data.payments.filter((p) => p.PaymentStatus === 'معلق').length}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ratings' && (
          <div className="space-y-8">
            {/* التقييمات حسب السائق */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">متوسط التقييمات حسب السائق</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingsByDriver}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="driver" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip formatter={(value) => [value, 'متوسط التقييم']} />
                  <Bar dataKey="avgRating" fill="#FFD700" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* تفاصيل التقييمات */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">آخر التقييمات</h2>
              <div className="space-y-4">
                {data.ratings.slice(0, 5).map((rating) => {
                  const driver = data.users.find((u) => u.Id === rating.DriverId);
                  const driverName = driver ? `${driver.FName} ${driver.LName}` : `سائق ${rating.DriverId}`;

                  return (
                    <div key={rating.RatingId} className="border-b border-gray-200 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{driverName}</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < rating.RatingValue ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-600">({rating.RatingValue}/5)</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">رحلة {rating.TripId}</span>
                      </div>
                      {rating.Comment && <p className="mt-2 text-sm text-gray-700">{rating.Comment}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportDataAnalysis;