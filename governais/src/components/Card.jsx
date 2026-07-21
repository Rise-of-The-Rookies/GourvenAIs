/**
 * Reusable Card component for content sections.
 */
export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-150 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-5 py-3.5 border-b border-slate-100 ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
};
