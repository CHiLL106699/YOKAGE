
import { useState } from "react";
import { ChevronDown, ChevronRight, Home, Search, User, Phone, Calendar, Hash } from "lucide-react";

const mockCustomers = [
  {
    id: 1,
    name: "Alice Johnson",
    avatar: "/avatars/01.png",
    phone: "555-0101",
    lastVisit: "2024-07-15",
    totalVisits: 12,
    recentTreatments: [
      { date: "2024-07-15", service: "Deep Tissue Massage", staff: "Emily White" },
      { date: "2024-06-20", service: "Aromatherapy", staff: "Emily White" },
    ],
  },
  {
    id: 2,
    name: "Bob Williams",
    avatar: "/avatars/02.png",
    phone: "555-0102",
    lastVisit: "2024-07-12",
    totalVisits: 5,
    recentTreatments: [
      { date: "2024-07-12", service: "Hot Stone Massage", staff: "John Doe" },
    ],
  },
  {
    id: 3,
    name: "Charlie Brown",
    avatar: "/avatars/03.png",
    phone: "555-0103",
    lastVisit: "2024-05-30",
    totalVisits: 28,
    recentTreatments: [
        { date: "2024-05-30", service: "Swedish Massage", staff: "Jane Smith" },
        { date: "2024-04-15", service: "Facial Treatment", staff: "Jane Smith" },
    ],
  },
  {
    id: 4,
    name: "Diana Miller",
    avatar: "/avatars/04.png",
    phone: "555-0104",
    lastVisit: "2024-07-18",
    totalVisits: 2,
    recentTreatments: [
        { date: "2024-07-18", service: "Couples Massage", staff: "Emily White" },
    ],
  },
];

type Customer = typeof mockCustomers[0];
type Treatment = Customer["recentTreatments"][0];

const StaffCustomers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCustomerId, setExpandedCustomerId] = useState<number | null>(null);

  const filteredCustomers = mockCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  );

  const toggleCustomer = (id: number) => {
    setExpandedCustomerId(expandedCustomerId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <a href="/staff" className="hover:text-primary flex items-center">
            <Home className="h-4 w-4 mr-1" />
            Staff
          </a>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Customers</span>
        </div>
        <h1 className="text-3xl font-bold">Customer Directory</h1>
      </header>

      <div className="bg-card p-6 rounded-lg shadow-md">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-input focus:ring-2 focus:ring-primary-focus focus:outline-none"
          />
        </div>

        <div className="space-y-4">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} isExpanded={expandedCustomerId === customer.id} onToggle={() => toggleCustomer(customer.id)} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No customers found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const CustomerCard = ({ customer, isExpanded, onToggle }: { customer: Customer, isExpanded: boolean, onToggle: () => void }) => {
  return (
    <div className="border rounded-lg bg-background/50 overflow-hidden">
      <div className="flex items-center p-4 cursor-pointer hover:bg-muted/50" onClick={onToggle}>
        <img src={customer.avatar} alt={customer.name} className="h-12 w-12 rounded-full mr-4" />
        <div className="flex-grow grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium">{customer.name}</span>
          </div>
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{customer.phone}</span>
          </div>
          <div className="hidden sm:flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Last Visit: {customer.lastVisit}</span>
          </div>
          <div className="hidden sm:flex items-center text-sm">
            <Hash className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Total Visits: {customer.totalVisits}</span>
          </div>
        </div>
        <div className="ml-auto pl-4">
            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 border-t bg-muted/20">
          <h4 className="font-semibold mb-3 text-base">Recent Treatments</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-2 px-3 font-normal">Date</th>
                  <th className="py-2 px-3 font-normal">Service</th>
                  <th className="py-2 px-3 font-normal">Staff</th>
                </tr>
              </thead>
              <tbody>
                {customer.recentTreatments.map((treatment, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 px-3">{treatment.date}</td>
                    <td className="py-2 px-3">{treatment.service}</td>
                    <td className="py-2 px-3">{treatment.staff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffCustomers;
