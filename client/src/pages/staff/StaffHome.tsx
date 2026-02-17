
import { Link } from 'wouter';
import { Home, ChevronRight, Clock, Calendar, Users, UserPlus, LogIn, LogOut } from 'lucide-react';

// Mock user data - in a real app, this would come from useAuth()
const mockUser = {
  name: 'Alex Doe',
};

// Mock data for the dashboard
const today = new Date();
const todaysShifts = [
  { id: 1, time: '09:00 - 12:00', type: 'Morning Shift', service: 'Deep Tissue Massage' },
  { id: 2, time: '14:00 - 15:00', type: 'Afternoon Shift', service: 'Aromatherapy' },
];

const pendingCustomers = [
  { id: 1, name: 'Jane Smith', service: 'Hot Stone Massage', time: '11:00' },
  { id: 2, name: 'Robert Johnson', service: 'Swedish Massage', time: '16:30' },
];

const statsCards = [
  { title: "Today's Appointments", value: '5', icon: Calendar },
  { title: 'Pending Approvals', value: '2', icon: UserPlus },
  { title: 'Clocked In', value: '08:55 AM', icon: Clock },
];

const StaffHome = () => {
  // const { user } = useAuth(); // Assuming useAuth returns a user object
  const user = mockUser;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Link to="/staff" className="hover:text-foreground flex items-center">
            <Home className="h-4 w-4 mr-2" />
            Staff
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Dashboard</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground">
          {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      <main className="grid gap-8">
        {/* Quick Actions and Stats */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Quick Action Buttons */}
            <div className="bg-card p-6 rounded-lg shadow-md flex flex-col justify-between">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  <LogIn className="h-5 w-5 mr-2" /> Clock In
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 border border-input bg-transparent text-sm font-medium rounded-md hover:bg-accent">
                  <LogOut className="h-5 w-5 mr-2" /> Clock Out
                </button>
                <Link to="/staff/schedule" className="w-full flex items-center justify-center px-4 py-2 border border-input bg-transparent text-sm font-medium rounded-md hover:bg-accent">
                  <Calendar className="h-5 w-5 mr-2" /> View Schedule
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            {statsCards.map((card, index) => (
              <div key={index} className="bg-card p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
                  <card.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule Summary */}
          <section className="lg:col-span-2 bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
            <div className="space-y-4">
              {todaysShifts.length > 0 ? (
                todaysShifts.map((shift) => (
                  <div key={shift.id} className="p-4 rounded-lg border bg-background/50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{shift.service}</p>
                        <p className="text-sm text-muted-foreground">{shift.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-medium">{shift.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No shifts scheduled for today.</p>
              )}
            </div>
          </section>

          {/* Pending Customers */}
          <section className="bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="h-6 w-6 mr-3" />
              Pending Customers
            </h2>
            <div className="space-y-4">
              {pendingCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.service}</p>
                  </div>
                  <button className="px-3 py-1 text-xs font-semibold rounded-full border border-primary text-primary hover:bg-primary/10">
                    Confirm
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StaffHome;
