
interface LinkItem {
  title: string;
  route: string;
  icon: string;
  hasSubMenu?: boolean;
  subLinks?: LinkItem[];
}


export const userLinks: LinkItem[] = [
  { title: 'Dashboard', route: '/business-owner/dashboard', icon: 'fi fi-tr-dashboard-monitor' },
  { title: 'Managers', route: '/business-owner/managers', icon: 'fi fi-tr-employees' },
  { title: 'Employees', route: '/business-owner/employees', icon: 'fi fi-tr-employees' },
  { title: 'Subscriptions', route: '/business-owner/subscriptions', icon: 'fi fi-tr-benefit' },
  { title: 'Chat', route: '/business-owner/chat', icon: 'fi fi-tr-messages' },
  { title: 'Meetings', route: '/business-owner/meeting', icon: 'fi fi-tr-circle-video' },
  { title: 'Service Requests', route: '/business-owner/service-requests', icon: 'fi fi-tr-user-headset' },
]