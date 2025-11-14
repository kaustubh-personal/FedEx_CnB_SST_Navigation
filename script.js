document.addEventListener('DOMContentLoaded', function () {
    console.log('Navigation script loaded in iframe context');
    
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

    // Handle collapse/expand with iframe compatibility
    document.querySelectorAll('.sidebar-menu li > a').forEach(function(link) {
        link.addEventListener('click', function(e) {
            console.log('Link clicked:', this.textContent);
            
            // Always prevent default to avoid navigation issues in iframe
            e.preventDefault();
            e.stopPropagation();
            
            let parentLi = this.parentElement;
            let hasSubMenu = parentLi.querySelector('ul');
            
            console.log('Has submenu:', !!hasSubMenu);
            
            if (hasSubMenu) {
                // This is a parent menu item - toggle expand/collapse
                console.log('Toggling submenu for:', this.textContent.trim());
                
                // Force toggle the open class
                if (parentLi.classList.contains('open')) {
                    parentLi.classList.remove('open');
                    console.log('Collapsed menu');
                } else {
                    parentLi.classList.add('open');
                    console.log('Expanded menu');
                }
                
                // Force style update for iframe compatibility
                setTimeout(function() {
                    parentLi.style.display = parentLi.style.display === 'none' ? 'block' : parentLi.style.display;
                }, 10);
                
            } else {
                // This is a leaf menu item - handle navigation
                console.log('Navigation item clicked:', this.textContent.trim());
                
                // Set active state
                document.querySelectorAll('.sidebar-menu a').forEach(function(a) {
                    a.classList.remove('active');
                });
                this.classList.add('active');
    
                // Enhanced Power BI navigation
                var pageName = this.dataset.pagename;
                if (pageName) {
                    console.log('Navigating to page:', pageName);
                    
                    // Method 1: Send message to Power BI parent window
                    try {
                        window.parent.postMessage({
                            action: 'switchPage',
                            page: pageName,
                            type: 'navigation',
                            timestamp: Date.now()
                        }, '*');
                        console.log('Sent message to parent window');
                    } catch (error) {
                        console.log('Parent messaging failed:', error);
                    }
                    
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
            
            // Return false to ensure no default action
            return false;
        }, true); // Use capture phase for iframe compatibility
    });

    // Set tooltips dynamically
    document.querySelectorAll('.sidebar-menu a').forEach(function(link) {
        if (!link.title) {
            link.title = "Navigate to " + (link.dataset.pagename || link.textContent);
        }
    });

    // Collapsible sidebar with iframe compatibility
    var sidebar = document.getElementById('sidebar');
    var toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Sidebar toggle clicked');
            sidebar.classList.toggle('collapsed');
            return false;
        }, true);
    }

    // Highlight active page on navigation (Power BI can post message back if necessary)
    window.addEventListener('message', function(event) {
        console.log('Received message:', event.data);
        if (event.data && event.data.page) {
            document.querySelectorAll('.sidebar-menu a').forEach(function(a) {
                a.classList.remove('active');
                if (a.dataset.pagename === event.data.page) {
                    a.classList.add('active');
                }
            });
        }
    });

    // Force CSS re-evaluation for iframe compatibility
    setTimeout(function() {
        document.body.style.display = 'block';
        console.log('Forced style refresh for iframe');
    }, 100);
});
