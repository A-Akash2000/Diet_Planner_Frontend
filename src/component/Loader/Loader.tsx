const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="flex flex-col items-center">
        <div className="flex space-x-2">
          <span className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" />
          <span className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-150" />
          <span className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-300" />
        </div>
        <p className="mt-4 text-gray-600 font-medium text-sm">Loading, please wait...</p>
      </div>
    </div>
  );
};

export default Loader;
