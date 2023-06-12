import { Dashboard } from './Dashboard';

import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate
} from "react-router-dom";
import { SponsoredGasExample } from './examples/SponsoredGasExample';
import { BatchExample } from './examples/BatchExample';
import { TransferExample } from './examples/TransferExample';


const links = [
  { path: '/gas-free', label: 'Pay Gas for Users', element: <SponsoredGasExample /> },
  { path: '/bundle', label: 'Bundle Transactions', element: <BatchExample /> },
  { path: '/transfer', label: 'ERC-20', element: <TransferExample /> },
];

const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard children={<Outlet />}
      links={links} />,
    errorElement: <Navigate to={'/'} replace />,
    children: [
      {
        index: true,
        element: <Navigate to={links[0].path} replace />
      },
      ...links
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />
}

export default App;
