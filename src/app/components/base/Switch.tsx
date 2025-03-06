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
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-(--color-toolbar-background) rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-(--color-toolbar-background) after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-(--color-toolbar-background) after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--color-switch-checked-background)"></div>
      </label>
      <span className="m-3 text-white">{label}</span>
    </div>
  );
};

export default Switch;
