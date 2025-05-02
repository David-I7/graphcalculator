import ResetPasswordForm from "../components/ResetPasswordForm";

export const Home = () => {
  return (
    <main>
      <header className="logo">
        <a href="/">Graph Calculator</a>
      </header>
      <section>
        <div className="reset-password-content">
          <h1 className="reset-password-heading">Reset your Password</h1>
          <ResetPasswordForm />
        </div>
      </section>
    </main>
  );
};

export default Home;
