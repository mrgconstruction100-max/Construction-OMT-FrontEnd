


export const mockProjects = [
  {
    id: "1",
    name: "Downtown Office Complex",
    description: "Modern 12-story office building with underground parking",
    status: "in-progress",
    progress: 65,
    startDate: "2024-01-15",
    endDate: "2024-12-30",
    client: "Metro Development Corp",
    manager: "John Smith",
    budget: 2500000,
    spent: 1625000
  },
  {
    id: "2", 
    name: "Riverside Residential",
    description: "50-unit luxury apartment complex with amenities",
    status: "in-progress",
    progress: 35,
    startDate: "2024-03-01",
    endDate: "2025-02-15",
    client: "Riverside Holdings",
    manager: "Sarah Johnson",
    budget: 1800000,
    spent: 630000
  },
  {
    id: "3",
    name: "Shopping Mall Renovation",
    description: "Complete renovation of existing 200,000 sq ft mall",
    status: "completed",
    progress: 100,
    startDate: "2023-09-01",
    endDate: "2024-01-30",
    client: "Retail Spaces LLC",
    manager: "Mike Davis",
    budget: 950000,
    spent: 920000
  },
  {
    id: "4",
    name: "Industrial Warehouse",
    description: "Climate-controlled storage facility with loading docks",
    status: "not-started",
    progress: 0,
    startDate: "2024-06-01",
    endDate: "2024-10-15",
    client: "LogiTech Solutions",
    manager: "Emily Chen",
    budget: 1200000,
    spent: 0
  }
]

export const mockTasks = [
  {
    id: "1",
    title: "Foundation Excavation",
    description: "Excavate and prepare foundation for main building",
    status: "completed",
    priority: "high",
    assignee: "Construction Crew A",
    projectId: "1",
    dueDate: "2024-02-15",
    progress: 100
  },
  {
    id: "2",
    title: "Steel Frame Installation",
    description: "Install structural steel framework for floors 1-6",
    status: "in-progress",
    priority: "high",
    assignee: "Steel Works Team",
    projectId: "1",
    dueDate: "2024-04-30",
    progress: 75
  },
  {
    id: "3",
    title: "Electrical Rough-in",
    description: "Install electrical wiring and conduits",
    status: "in-progress",
    priority: "medium",
    assignee: "ElectriCorp",
    projectId: "1",
    dueDate: "2024-05-15",
    progress: 45
  },
  {
    id: "4",
    title: "Site Preparation", 
    description: "Clear site and establish construction access",
    status: "completed",
    priority: "high",
    assignee: "Site Prep Team",
    projectId: "2",
    dueDate: "2024-03-15",
    progress: 100
  },
  {
    id: "5",
    title: "Permits and Approvals",
    description: "Obtain all necessary construction permits",
    status: "not-started",
    priority: "high",
    assignee: "Legal Team",
    projectId: "4",
    dueDate: "2024-05-30",
    progress: 0
  }
]

export const mockTeamMembers = [
  {
    id: "1",
    name: "John Smith",
    role: "Manager",
    email: "john.smith@buildpro.com",
    phone: "(555) 123-4567",
    activeProjects: 2
  },
  {
    id: "2",
    name: "Sarah Johnson", 
    role: "Manager",
    email: "sarah.johnson@buildpro.com",
    phone: "(555) 234-5678",
    activeProjects: 1
  },
  {
    id: "3",
    name: "Mike Davis",
    role: "Manager",
    email: "mike.davis@buildpro.com", 
    phone: "(555) 345-6789",
    activeProjects: 0
  },
  {
    id: "4",
    name: "Emily Chen",
    role: "Admin",
    email: "emily.chen@buildpro.com",
    phone: "(555) 456-7890",
    activeProjects: 1
  },
  {
    id: "5",
    name: "Construction Crew A",
    role: "Worker",
    email: "crew.a@buildpro.com",
    phone: "(555) 567-8901",
    activeProjects: 3
  },
  {
    id: "6",
    name: "Steel Works Team",
    role: "Worker", 
    email: "steelworks@buildpro.com",
    phone: "(555) 678-9012",
    activeProjects: 2
  }
]

export const mockClients = [
  {
    id: "1",
    name: "Metro Development Corp",
    company: "Metro Development Corp",
    email: "contact@metrodevelopment.com",
    phone: "(555) 111-2222",
    projects: 1,
    totalValue: 2500000
  },
  {
    id: "2",
    name: "Riverside Holdings",
    company: "Riverside Holdings",
    email: "info@riversideholdings.com", 
    phone: "(555) 222-3333",
    projects: 1,
    totalValue: 1800000
  },
  {
    id: "3",
    name: "Retail Spaces LLC",
    company: "Retail Spaces LLC",
    email: "projects@retailspaces.com",
    phone: "(555) 333-4444",
    projects: 1,
    totalValue: 950000
  },
  {
    id: "4",
    name: "LogiTech Solutions",
    company: "LogiTech Solutions",
    email: "construction@logitech.com",
    phone: "(555) 444-5555", 
    projects: 1,
    totalValue: 1200000
  }
]