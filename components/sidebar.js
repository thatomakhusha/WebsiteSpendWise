let sidebar;
let sidebarToggleBtn;
let searchForm;

export function initSidebar() {
    sidebar = document.querySelector(".sidebar");
    sidebarToggleBtn = document.querySelectorAll(".sidebar-toggle");
    searchForm = document.querySelector(".search-form");

    if (!sidebar) return;

    // initial state
    if(window.innerWidth >768){
        sidebar.classList.add("collapsed");
    }

    //toggle sidebar
    if (sidebarToggleBtn) {
        sidebarToggleBtn.forEach(btn => {
            btn.addEventListener("click", () => {
                sidebar.classList.toggle("collapsed");
            });
        });
    }

    // expand sidebar when searching
    if (searchForm) {
        searchForm.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");

                const input = searchForm.querySelector("input");
                if (input) input.focus();
            }
        });
    }
}



    // EVENTS
    
    

    