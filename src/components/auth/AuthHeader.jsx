const AuthHeader = ({ subtitle }) => {
  return (
    <div className="text-center mb-6">
      <img
        src="https://www.modula.in/images/modula_jsw.svg"
        alt="Modula by JSW"
        className="h-10 mx-auto mb-2"
      />
      <p className="text-sm text-primary-grey-600">
        {subtitle}
      </p>
    </div>
  );
};

export default AuthHeader;
