
interface LinkItem {
  title: string;
  route: string;
  icon: string;
  hasSubMenu?: boolean;
  subLinks?: LinkItem[];
}


export const userLinks: LinkItem[] = [
  { title: 'Dashboard', route: '/user/dashboard', icon: 'fi fi-tr-dashboard-monitor' },
  { title: 'Customers', route: '/user/customers', icon: 'fi fi-tr-employees' },
  { title: 'Products', route: '/user/products', icon: 'fi fi-tr-box-open-full' },
  { title: 'Sales', route: '/user/sales', icon: 'fi fi-tr-basket-shopping-simple' },
]