import { ChangeEvent, useState } from "react";
import ButtonTarget from "../../../components/buttons/target/ButtonTarget";
import InputDropdown from "../../../components/dropdown/inputDropdown/InputDropdown";
import { ArrowLeft, Edit, Plus } from "../../../components/svgs";

const defaultText = "Untitled";

const ExpressionTopBar = () => {
  const [inputValue, setInputVal] = useState<string>(
    (false && "store.userGraph") || defaultText
  );

  const handleChange = (e: ChangeEvent) => {
    setInputVal((e.target as HTMLInputElement).value);
  };

  return (
    <header className="expression-panel-top-bar">
      <div className="expression-panel-top-bar__left">
        <InputDropdown
          defaultValue={defaultText}
          inputProps={{
            className: "bg-surface-container-low button--hovered",
            value: inputValue,
            onChange: handleChange,
          }}
        >
          <></>
        </InputDropdown>
      </div>
      <div className="expression-panel-top-bar__right">
        {/* ADD A BACKGROUND color to buttons */}
        <ButtonTarget className="button--hovered bg-surface-container-low">
          <Plus />
        </ButtonTarget>
        <ButtonTarget className="button--hovered bg-surface-container-low">
          <Edit />
        </ButtonTarget>
        <ButtonTarget className="button--hovered bg-surface-container-low">
          <ArrowLeft />
        </ButtonTarget>
      </div>
    </header>
  );
};

export default ExpressionTopBar;
