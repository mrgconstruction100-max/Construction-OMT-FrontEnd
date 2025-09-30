import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard/Dashboard';
import Projects from './pages/projects/Project';
import { AppLayout } from './components/layout/AppLayout';
import Phases from './pages/phases/Phases';
import Reports from './pages/reports/Reports';
import Tasks from './pages/tasks/Tasks';
import Members from './pages/members/Members';
import Clients from './pages/clients/Clients';
import Documents from './pages/Documents';
import Settings from './pages/Settings/Settings';
import PrivateRoute from './PrivateRoute';
import LoginForm from './LoginForm';
import Expense from './pages/expenses/Expense';
import Unauthorized from './pages/Unauthorized/Unauthorized';
import NotFound from './pages/NotFound';
import UserList from './pages/userList/UserList';

import TaskDetail from './pages/tasks/TaskDetail';
import ExpenseDetail from './pages/expenses/ExpenseDetail';
import PhaseDetail from './pages/phases/PhaseDetail';
import ProjectDetail from './pages/projects/ProjectDetail';
import Income from './pages/income/Income';
import IncomeDetail from './pages/income/IncomeDetail';
import ClientDetail from './pages/clients/ClientDetail';
import MemberDetail from './pages/members/MemberDetail';
import ProfileSettings from './pages/Settings/ProfileSettings';
import RecentActivityDetailPage from './components/dashboard/RecentActivityDetailedPage';





function App() {
  return (
  <Router>
      <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute> }>
          <Route index element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/projects" element={<PrivateRoute roles={['Admin']}><Projects /></PrivateRoute>} />
          <Route path="project/:id" element={<PrivateRoute roles={['Admin']}><ProjectDetail /></PrivateRoute>} />
          <Route path="/phases" element={<PrivateRoute roles={['Admin']}><Phases /></PrivateRoute>} />
          <Route path="phase/:id" element={<PrivateRoute roles={['Admin']}><PhaseDetail /></PrivateRoute>} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/tasks" element={<Tasks />} />
           <Route path="task/:id" element={<TaskDetail />} />
           <Route path="expense/:id" element={<ExpenseDetail />} />
          <Route path="/expenses" element={<Expense />} />
          <Route path="/incomes" element={<PrivateRoute roles={['Admin']}><Income/></PrivateRoute>} />
           <Route path="income/:id" element={<PrivateRoute roles={['Admin']}><IncomeDetail/></PrivateRoute>} />
          <Route path="/members" element={<PrivateRoute roles={['Admin']}><Members /></PrivateRoute>} />
          <Route path="member/:id" element={<PrivateRoute roles={['Admin']}><MemberDetail /></PrivateRoute>} />
          <Route path="/clients" element={<PrivateRoute roles={['Admin']}><Clients /></PrivateRoute>} />
          <Route path="client/:id" element={<PrivateRoute roles={['Admin']}><ClientDetail /></PrivateRoute>} />
          <Route path="/userList" element={<PrivateRoute roles={['Admin']}><UserList /></PrivateRoute>} />
          <Route path="/documents" element={<PrivateRoute><Documents /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute roles={['Admin']}><Settings /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute roles={['Admin']}><ProfileSettings /></PrivateRoute>} />
           <Route path="/recentDetailed" element={<PrivateRoute roles={['Admin']}><RecentActivityDetailPage/></PrivateRoute>} />

          <Route path="/unauthorized" element={<Unauthorized/>} />

          {/* add other routes here */}
          <Route path="*" element={<NotFound />} />
          </Route>
      </Routes>
    </Router>
     
  )
}

export default App