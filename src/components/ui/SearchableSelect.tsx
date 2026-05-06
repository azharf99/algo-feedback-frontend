import Select, { Props as SelectProps, GroupBase } from 'react-select'
import { Control, Controller, FieldValues, Path } from 'react-hook-form'
import { clsx } from 'clsx'

export interface SelectOption {
  value: string | number
  label: string
}

interface SearchableSelectProps<
  TFieldValues extends FieldValues,
  IsMulti extends boolean = false
> extends Omit<SelectProps<SelectOption, IsMulti, GroupBase<SelectOption>>, 'value' | 'onChange'> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  options: SelectOption[]
  label?: string
  error?: string
  placeholder?: string
  isMulti?: IsMulti
}

const SearchableSelect = <
  TFieldValues extends FieldValues,
  IsMulti extends boolean = false
>({
  name,
  control,
  options,
  label,
  error,
  placeholder = 'Search or select...',
  isMulti,
  className,
  ...props
}: SearchableSelectProps<TFieldValues, IsMulti>) => {
  return (
    <div className={clsx("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ref } }) => {
          // Handle value conversion between React Select and React Hook Form
          const selectedValue = isMulti
            ? options.filter(opt => (value as any[])?.includes(opt.value))
            : options.find(opt => opt.value === value) || null

          return (
            <Select
              ref={ref}
              {...props}
              isMulti={isMulti}
              options={options}
              value={selectedValue}
              placeholder={placeholder}
              onChange={(val: any) => {
                if (isMulti) {
                  onChange((val as SelectOption[])?.map(v => v.value) || [])
                } else {
                  onChange((val as SelectOption)?.value || null)
                }
              }}
              unstyled
              classNames={{
                control: ({ isFocused }) =>
                  clsx(
                    "flex w-full border rounded-md shadow-sm min-h-[40px] px-1 transition-all duration-200",
                    "bg-white dark:bg-gray-800",
                    isFocused
                      ? "ring-1 ring-blue-500 border-blue-500"
                      : error
                      ? "border-red-300"
                      : "border-gray-300 dark:border-gray-700"
                  ),
                placeholder: () => "text-gray-500 dark:text-gray-400 px-2",
                input: () => "text-gray-900 dark:text-white px-2",
                singleValue: () => "text-gray-900 dark:text-white px-2",
                multiValue: () => "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded px-2 py-0.5 m-1 text-sm flex items-center",
                multiValueLabel: () => "leading-none",
                multiValueRemove: () => "ml-1 hover:text-red-500 transition-colors cursor-pointer",
                menu: () => "mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 overflow-hidden",
                menuList: () => "py-1 max-h-[300px] overflow-y-auto",
                option: ({ isFocused, isSelected }) =>
                  clsx(
                    "px-3 py-2 text-sm cursor-pointer transition-colors",
                    isSelected
                      ? "bg-blue-600 text-white"
                      : isFocused
                      ? "bg-blue-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                      : "text-gray-700 dark:text-gray-300"
                  ),
                noOptionsMessage: () => "p-4 text-gray-500 dark:text-gray-400 text-sm text-center",
                loadingMessage: () => "p-4 text-gray-500 dark:text-gray-400 text-sm text-center",
                clearIndicator: () => "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer",
                dropdownIndicator: () => "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 cursor-pointer",
                indicatorsContainer: () => "gap-1 pr-1",
              }}
            />
          )
        }}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default SearchableSelect
