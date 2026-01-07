import { createBrowserRouter, redirect } from 'react-router-dom';

import ResourceCalcPage from '@/modules/resource-calc/resource-calc-page';
import GraphPlacementPage from '@/modules/graph-placement/pages/graph-placement-page';
import Layout from '@/shared/layout';

export const createRouter = () => {
  return createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          loader() {
            return redirect('/resource-calc');
          },
        },
        {
          path: 'resource-calc',
          element: <ResourceCalcPage />,
        },
        {
          path: 'graph-placement',
          element: <GraphPlacementPage />,
        },
      ],
    },
    {
      path: '*',
      loader() {
        return redirect('/resource-calc');
      },
    },
  ]);
};
