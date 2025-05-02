import { useErrorBoundary } from "react-error-boundary";
import FilledButton from "../buttons/common/FilledButton";
import "./assets/base.scss";

export function ErrorFallback({ error }: { error: Error }) {
  const { resetBoundary } = useErrorBoundary();

  return (
    <main>
      <header className="logo">
        <a href="/">Graph Calculator</a>
      </header>
      <section className="error-section">
        <div role="alert">
          <h1 className="error-heading">Oh no! Something went wrong :(</h1>

          <p>Try refreshing the page</p>
          <FilledButton role="link" onClick={() => window.location.reload()}>
            Refresh page
          </FilledButton>
        </div>
      </section>
    </main>
  );
}
