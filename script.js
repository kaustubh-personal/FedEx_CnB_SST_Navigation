document.addEventListener('DOMContentLoaded', function () {
    console.log('Navigation script loaded in iframe context');
    
    // Force immediate style application for Power BI iframe
    function forceStyleUpdate() {
        document.querySelectorAll('.sidebar-menu ul').forEach(function(ul) {
            var parent = ul.parentElement;
            if (parent.classList.contains('open')) {
                ul.style.display = 'block';
                ul.style.visibility = 'visible';
                ul.style.opacity = '1';
                ul.style.maxHeight = 'none';
            } else {
                ul.style.display = 'none';
                ul.style.visibility = 'hidden';
                ul.style.opacity = '0';
                ul.style.maxHeight = '0';
            }
        });
    }
    
    // Start with all menus collapsed for better user control
    document.querySelectorAll('.sidebar-menu li').forEach(function(li) {
        li.classList.remove('open');
    });
    
    // Force initial style application
    forceStyleUpdate();
    
    // Check for selected page from URL or localStorage
    var urlParams = new URLSearchParams(window.location.search);
    var selectedPage = urlParams.get('page') || localStorage.getItem('selectedPage');
    
    if (selectedPage) {
        console.log('Restoring selected page:', selectedPage);
        document.querySelectorAll('.sidebar-menu a').forEach(function(a) {
            if (a.dataset.pagename === selectedPage) {
                a.classList.add('active');
                // Expand parent menus
                var parent = a.parentElement;
                while (parent && parent.tagName === 'LI') {
                    parent.classList.add('open');
                    parent = parent.parentElement.parentElement;
                }
            }
        });
        forceStyleUpdate();
    }

    // Handle collapse/expand with POWER BI IFRAME COMPATIBILITY
    document.querySelectorAll('.sidebar-menu li > a').forEach(function(link) {
        link.addEventListener('click', function(e) {
            console.log('Link clicked in Power BI iframe:', this.textContent);
            
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            let parentLi = this.parentElement;
            let hasSubMenu = parentLi.querySelector('ul');
            
            console.log('Has submenu:', !!hasSubMenu, 'Parent element:', parentLi);
            
            if (hasSubMenu) {
                console.log('Processing submenu toggle for:', this.textContent.trim());
                
                // Force toggle with multiple methods for iframe compatibility
                var isCurrentlyOpen = parentLi.classList.contains('open');
                
                if (isCurrentlyOpen) {
                    parentLi.classList.remove('open');
                    console.log('Removing open class');
                } else {
                    parentLi.classList.add('open');
                    console.log('Adding open class');
                }
                
                // FORCE STYLE UPDATE IMMEDIATELY
                var submenu = parentLi.querySelector('ul');
                if (submenu) {
                    if (parentLi.classList.contains('open')) {
                        // Force show
                        submenu.style.display = 'block';
                        submenu.style.visibility = 'visible';
                        submenu.style.opacity = '1';
                        submenu.style.maxHeight = 'none';
                        submenu.style.overflow = 'visible';
                        console.log('FORCED submenu to show');
                    } else {
                        // Force hide
                        submenu.style.display = 'none';
                        submenu.style.visibility = 'hidden';
                        submenu.style.opacity = '0';
                        submenu.style.maxHeight = '0';
                        submenu.style.overflow = 'hidden';
                        console.log('FORCED submenu to hide');
                    }
                }
                
                // Multiple forced updates for stubborn iframe
                setTimeout(forceStyleUpdate, 10);
                setTimeout(forceStyleUpdate, 50);
                setTimeout(forceStyleUpdate, 100);
                
            } else {
                // Navigation item
                console.log('Navigation item clicked:', this.textContent.trim());
                
                // Set active state
                document.querySelectorAll('.sidebar-menu a').forEach(function(a) {
                    a.classList.remove('active');
                });
                this.classList.add('active');
    
                // Power BI navigation
                var pageName = this.dataset.pagename;
                if (pageName) {
                    console.log('Navigating to page:', pageName);
                    
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
                    
                    try {
                        localStorage.setItem('selectedPage', pageName);
                    } catch (error) {
                        console.log('localStorage failed:', error);
                    }
                }
            }
            
            return false;
        }, true)
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

    // POWER BI IFRAME FORCE REFRESH - Multiple attempts
    setTimeout(function() {
        console.log('Force refresh #1');
        forceStyleUpdate();
        document.body.style.display = 'block';
    }, 100);
    
    setTimeout(function() {
        console.log('Force refresh #2');
        forceStyleUpdate();
    }, 500);
    
    setTimeout(function() {
        console.log('Force refresh #3');
        forceStyleUpdate();
    }, 1000);
    
    // Watch for class changes and force style updates
    if (window.MutationObserver) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    console.log('Class change detected, forcing style update');
                    forceStyleUpdate();
                }
            });
        });
        
        document.querySelectorAll('.sidebar-menu li').forEach(function(li) {
            observer.observe(li, { attributes: true, attributeFilter: ['class'] });
        });
    }
});
