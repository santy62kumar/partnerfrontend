const AuthHeader = ({ title = "Welcome", subtitle }) => {
  return (
    <div className="text-center mb-6">
      <img
        src="https://www.modula.in/images/modula_jsw.svg"
        alt="Modula by JSW"
        className="h-10 mx-auto mb-3"
      />
      <h1 className="text-2xl font-bold font-heading text-foreground mb-1">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground">
        {subtitle}
      </p>
    </div>
  );
};

export default AuthHeader;
