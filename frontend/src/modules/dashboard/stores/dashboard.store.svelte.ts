interface DashboardStats {
  tweets: number;
  fallenTree: number;
  garbage: number;
  vandalism: number;
  unreadNotifs: number;
}

let _stats = $state<DashboardStats>({
  tweets: 0,
  fallenTree: 0,
  garbage: 0,
  vandalism: 0,
  unreadNotifs: 0,
});

export const dashboardStore = {
  get stats() { return _stats; },
  setStats(s: DashboardStats) { _stats = s; },
};
