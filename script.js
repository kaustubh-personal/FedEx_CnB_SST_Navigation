document.addEventListener('DOMContentLoaded', function () {
    // Start with all menus collapsed for better user control
    // Users can click on "Global C&B" to see the 3 main sections
    // and click on "Go-Fast Now (FY26)" to see the 6 subsections
    
    // Ensure all menus start collapsed by removing any 'open' class
    document.querySelectorAll('.sidebar-menu li').forEach(function(li) {
        li.classList.remove('open');
    });
    
    // Check for selected page from URL or localStorage
    var urlParams = new URLSearchParams(window.location.search);
    var selectedPage = urlParams.get('page') || localStorage.getItem('selectedPage');
    
    if (selectedPage) {
        console.log('Restoring selected page:', selectedPage);
        // Highlight the selected page
        document.querySelectorAll('.sidebar-menu a').forEach(function(a) {
            if (a.dataset.pagename === selectedPage) {
                a.classList.add('active');
                // Also expand parent menus
                var parent = a.parentElement;
                while (parent && parent.tagName === 'LI') {
                    parent.classList.add('open');
                    parent = parent.parentElement.parentElement;
                }
            }
        });
    }

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
    
                // Enhanced Power BI navigation
                var pageName = this.dataset.pagename;
                if (pageName) {
                    console.log('Navigating to page:', pageName);
                    
                    // Method 1: Send message to Power BI (may not work in iframe)
                    window.parent.postMessage({
                        action: 'switchPage',
                        page: pageName,
                        type: 'navigation'
                    }, '*');
                    
                    // Method 2: Use URL parameters for Power BI Actions
                    try {
                        var currentUrl = window.location.href;
                        var baseUrl = currentUrl.split('?')[0];
                        var newUrl = baseUrl + '?page=' + encodeURIComponent(pageName) + '&timestamp=' + Date.now();
                        
                        // Update URL without refresh (for tracking)
                        if (window.history && window.history.pushState) {
                            window.history.pushState({page: pageName}, '', newUrl);
                        }
                        
                        console.log('Updated URL for Power BI Action:', newUrl);
                        
                        // Store selected page in localStorage for persistence
                        localStorage.setItem('selectedPage', pageName);
                        
                    } catch (error) {
                        console.log('URL update failed:', error);
                    }
                    
                    // Method 3: Try Power BI API (fallback)
                    try {
                        if (window.parent && window.parent.powerbi) {
                            window.parent.powerbi.navigateToPage(pageName);
                        }
                    } catch (error) {
                        console.log('Power BI API not available:', error);
                    }
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
