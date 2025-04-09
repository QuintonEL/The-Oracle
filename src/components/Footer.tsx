const Footer = () => {
  return (
    <footer className="w-full text-center py-2 mt-12 text-sm text-gray-400 sticky top-[100vh]">
      <p className="text-sm text-gray-400">
        🔮 <span className="font-semibold text-white">The Oracle</span>{" "}
        &nbsp;•&nbsp; Built by{" "}
        <a
          href="https://github.com/QuintonEL"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-purple-400"
        >
          Quinton
        </a>{" "}
        &nbsp;•&nbsp; {new Date().getFullYear()}
      </p>
    </footer>
  );
};

export default Footer;
