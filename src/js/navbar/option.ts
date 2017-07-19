enum TargetMode {
    tab,
    self,
    blank,
    window
}

interface NavbarOption {
    data?: {[id: string]: any};
    bottom?: {[id: string]: any};
    tab?: JQuery,
    default?: string,
}

class NavbarDefaultOption implements NavbarOption {
    
}

interface TabOption {
    active: (NavItem)=>void
}