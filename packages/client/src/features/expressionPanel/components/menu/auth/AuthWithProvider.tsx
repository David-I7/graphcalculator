import { Provider, UserSessionData } from "@graphcalculator/types";
import ButtonTarget from "../../../../../components/buttons/target/ButtonTarget";
import { ArrowLeft } from "../../../../../components/svgs";
import strategies from "../../../../../data/oauthStrategies";
import { OAuth2 } from "./OAuth2";

type AuthWithProviderProps = {
  email: string;
  onComplete: (res: { data: { user: UserSessionData } }) => void;
  handlePreviousStep: () => void;
  provider: Exclude<Provider, Provider.graphCalculator>;
};

export const AuthWithProvider = ({
  email,
  handlePreviousStep,
  onComplete,
  provider,
}: AuthWithProviderProps) => {
  return (
    <div className="auth-form auth-with-provider">
      <div className="auth-form-header">
        <ButtonTarget className="button--hovered bg-surface">
          <ArrowLeft onClick={() => handlePreviousStep()} />
        </ButtonTarget>
        <h2>Welcome back!</h2>
      </div>

      <div className="auth-form-body">
        <div className="auth-form-body-content">
          <p>
            You're logging in with <strong>{email}</strong>
          </p>
          <OAuth2 onComplete={onComplete} stategies={[strategies[provider]]} />
        </div>
      </div>
    </div>
  );
};
