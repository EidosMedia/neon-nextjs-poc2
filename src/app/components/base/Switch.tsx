interface SwitchProps {
  checked: boolean;
  label: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label }) => {
  return (
    <div className="flex items-center mx-4">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="switch-btn"></div>
      </label>
      <span className="m-3 text-white">{label}</span>
    </div>
  );
};

export default Switch;
