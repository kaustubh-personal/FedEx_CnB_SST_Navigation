document.addEventListener('DOMContentLoaded', function () {
    // Start with all menus collapsed for better user control
    // Users can click on "Global C&B" to see the 3 main sections
    // and click on "Go-Fast Now (FY26)" to see the 6 subsections
    
    // Ensure all menus start collapsed by removing any 'open' class
    document.querySelectorAll('.sidebar-menu li').forEach(function(li) {
        li.classList.remove('open');
    });

    // Handle collapse/expand
    document.querySelectorAll('.sidebar-menu li > a').forEach(function(link) {
        link.addEventListener('click', function(e) {
            let parentLi = this.parentElement;
            let hasSubMenu = parentLi.querySelector('ul');
            if (hasSubMenu) {
                e.preventDefault();
                parentLi.classList.toggle('open');
            } else {
                // Set active state
                document.querySelectorAll('.sidebar-menu a').forEach(function(a) {
                    a.classList.remove('active');
                });
                this.classList.add('active');
    
                // Power BI navigation
                var pageName = this.dataset.pagename;
                if (pageName) {
                    window.parent.postMessage({ action: 'switchPage', page: pageName }, '*');
                }
            }
        });
    });

    // Set tooltips dynamically
    document.querySelectorAll('.sidebar-menu a').forEach(function(link) {
        if (!link.title) {
            link.title = "Navigate to " + (link.dataset.pagename || link.textContent);
        }
    });

    // Collapsible sidebar
    var sidebar = document.getElementById('sidebar');
    var toggleBtn = document.getElementById('sidebarToggle');
    toggleBtn.addEventListener('click', function () {
        sidebar.classList.toggle('collapsed');
    });

    // Highlight active page on navigation (Power BI can post message back if necessary)
    window.addEventListener('message', function(event) {
        if (event.data && event.data.page) {
            document.querySelectorAll('.sidebar-menu a').forEach(function(a) {
                a.classList.remove('active');
                if (a.dataset.pagename === event.data.page) {
                    a.classList.add('active');
                }
            });
        }
    });
});
