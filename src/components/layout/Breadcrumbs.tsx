import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';
import { motion } from 'framer-motion';

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const formatBreadcrumb = (str: string) => {
    return str
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav className="flex items-center space-x-1.5 text-sm">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span>Home</span>
        </Link>
      </motion.div>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;

        return (
          <Fragment key={routeTo}>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              {isLast ? (
                <span className="font-semibold text-foreground bg-primary/10 px-2 py-1 rounded-md">
                  {formatBreadcrumb(name)}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
                >
                  {formatBreadcrumb(name)}
                </Link>
              )}
            </motion.div>
          </Fragment>
        );
      })}
    </nav>
  );
}
