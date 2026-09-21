const Alert = ({ message, type = 'error' }) => {
  if (!message) return null;
  const bgColor = type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700';
  return (
    <div className={`p-4 rounded-md mb-4 ${bgColor}`}>
      <p className="text-sm">{message}</p>
    </div>
  );
};
export default Alert;
