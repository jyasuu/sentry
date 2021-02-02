import React from 'react';
import styled from '@emotion/styled';

import {t} from 'app/locale';
import space from 'app/styles/space';
import Input from 'app/views/settings/components/forms/controls/input';

type Props = {
  name: string;

  /**
   * min allowed value, not needed if using `allowedValues`
   */
  min?: number;

  /**
   * max allowed value, not needed if using `allowedValues`
   */
  max?: number;

  /**
   * String is a valid type here only for empty string
   * Otherwise react complains:
   * "`value` prop on `input` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components."
   *
   * And we want this to be a controlled input when value is empty
   */
  value: number | '';
  step?: number;
  disabled?: boolean;

  /**
   * Render prop for slider's label
   * Is passed the value as an argument
   */
  formatLabel?: (value: number | '') => React.ReactNode;

  /**
   * Array of allowed values. Make sure `value` is in this list.
   * THIS NEEDS TO BE SORTED
   */
  allowedValues?: number[];

  /**
   * Show input control for custom values
   */
  showCustomInput?: boolean;

  // Placeholder for custom input
  placeholder?: string;

  /**
   * This is called when *any* MouseUp or KeyUp event happens.
   * Used for "smart" Fields to trigger a "blur" event. `onChange` can
   * be triggered quite frequently
   */
  onBlur?: (value, event?) => void;
  onChange?: Function;
};

type State = {
  sliderValue: number | '';
};

class RangeSlider extends React.Component<Props, State> {
  state: State = {
    sliderValue: this.props.allowedValues
      ? // With `allowedValues` sliderValue will be the index to value in `allowedValues`
        // This is so we can snap the rangeSlider using `step`
        // This means that the range slider will have a uniform `step` in the UI
        // and scale won't match `allowedValues
        // e.g. with allowedValues = [0, 100, 1000, 10000] - in UI we'll have values = [0, 3] w/ step of 1
        // so it always snaps at 25% width
        this.props.allowedValues.indexOf(Number(this.props.value || 0))
      : this.props.value,
  };

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    // Update local state when re-rendered with next `props.value` (e.g if this is controlled)
    if (typeof nextProps.value !== 'undefined') {
      const {allowedValues} = this.props;
      let sliderValue = nextProps.value;

      // If `allowedValues` is defined, then `sliderValue` represents index to `allowedValues`
      if (allowedValues && allowedValues.indexOf(Number(sliderValue || 0)) > -1) {
        sliderValue = allowedValues.indexOf(Number(sliderValue || 0));
      }
      this.setState({sliderValue});
    }
  }

  getActualValue = (sliderValue: State['sliderValue']): number | '' => {
    const {allowedValues} = this.props;
    let value: number | '';

    if (allowedValues) {
      // If `allowedValues` is defined, then `sliderValue` represents index to `allowedValues`
      value = allowedValues[sliderValue];
    } else {
      value = sliderValue;
    }

    return value;
  };

  setValue = value => {
    this.setState({
      sliderValue: value,
    });
  };

  changeValue = (value, e) => {
    if (this.props.onChange) {
      this.props.onChange(this.getActualValue(value), e);
    }
  };

  handleInput = e => {
    const sliderValue = parseInt(e.target.value, 10);
    this.setValue(sliderValue);
    this.changeValue(sliderValue, e);
  };

  handleBlur = e => {
    const {onBlur} = this.props;
    if (typeof onBlur !== 'function') {
      return;
    }

    onBlur(e);
  };

  handleCustomInputChange = e => {
    const value = parseInt(e.target.value, 10);
    this.setValue(isNaN(value) ? 0 : value);
  };

  handleCustomInputBlur = e => {
    this.handleInput(e);
  };

  render() {
    let {min, max, step} = this.props;
    const {
      name,
      disabled,
      allowedValues,
      formatLabel,
      placeholder,
      showCustomInput,
    } = this.props;
    const {sliderValue} = this.state;
    let actualValue = sliderValue;
    let displayValue: React.ReactNode = actualValue;

    if (allowedValues) {
      step = 1;
      min = 0;
      max = allowedValues.length - 1;
      actualValue = allowedValues[sliderValue];
      displayValue =
        typeof actualValue !== 'undefined' ? actualValue : t('Invalid value');
    }

    displayValue =
      typeof formatLabel === 'function' ? formatLabel(actualValue) : displayValue;

    return (
      <div>
        {!showCustomInput && <Label htmlFor={name}>{displayValue}</Label>}
        <SliderAndInputWrapper showCustomInput={showCustomInput}>
          <Slider
            type="range"
            name={name}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onInput={this.handleInput}
            onChange={() => {}}
            onMouseUp={this.handleBlur}
            onKeyUp={this.handleBlur}
            value={sliderValue}
            hasLabel={!showCustomInput}
          />
          {showCustomInput && (
            <Input
              placeholder={placeholder}
              value={sliderValue}
              onChange={this.handleCustomInputChange}
              onBlur={this.handleCustomInputBlur}
            />
          )}
        </SliderAndInputWrapper>
      </div>
    );
  }
}

export default RangeSlider;

const Slider = styled('input')<{hasLabel: boolean}>`
  /* stylelint-disable-next-line property-no-vendor-prefix */
  -webkit-appearance: none;
  width: 100%;
  margin: ${p => p.theme.grid}px 0 ${p => p.theme.grid * (p.hasLabel ? 2 : 1)}px;

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 3px;
    cursor: pointer;
    background: ${p => p.theme.border};
    border-radius: 3px;
    border: 0;
  }

  &::-moz-range-track {
    width: 100%;
    height: 3px;
    cursor: pointer;
    background: ${p => p.theme.border};
    border-radius: 3px;
    border: 0;
  }

  &::-ms-track {
    width: 100%;
    height: 3px;
    cursor: pointer;
    background: ${p => p.theme.border};
    border-radius: 3px;
    border: 0;
  }

  &::-webkit-slider-thumb {
    box-shadow: 0 0 0 3px ${p => p.theme.background};
    height: 17px;
    width: 17px;
    border-radius: 50%;
    background: ${p => p.theme.active};
    cursor: pointer;
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -webkit-appearance: none;
    margin-top: -7px;
    border: 0;
  }

  &::-moz-range-thumb {
    box-shadow: 0 0 0 3px ${p => p.theme.background};
    height: 17px;
    width: 17px;
    border-radius: 50%;
    background: ${p => p.theme.active};
    cursor: pointer;
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -webkit-appearance: none;
    margin-top: -7px;
    border: 0;
  }

  &::-ms-thumb {
    box-shadow: 0 0 0 3px ${p => p.theme.background};
    height: 17px;
    width: 17px;
    border-radius: 50%;
    background: ${p => p.theme.active};
    cursor: pointer;
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -webkit-appearance: none;
    margin-top: -7px;
    border: 0;
  }

  &::-ms-fill-lower {
    background: ${p => p.theme.border};
    border: 0;
    border-radius: 50%;
  }

  &::-ms-fill-upper {
    background: ${p => p.theme.border};
    border: 0;
    border-radius: 50%;
  }

  &:focus {
    outline: none;

    &::-webkit-slider-runnable-track {
      background: ${p => p.theme.border};
    }

    &::-ms-fill-upper {
      background: ${p => p.theme.border};
    }

    &::-ms-fill-lower {
      background: ${p => p.theme.border};
    }
  }

  &[disabled] {
    &::-webkit-slider-thumb {
      background: ${p => p.theme.border};
      cursor: default;
    }

    &::-moz-range-thumb {
      background: ${p => p.theme.border};
      cursor: default;
    }

    &::-ms-thumb {
      background: ${p => p.theme.border};
      cursor: default;
    }

    &::-webkit-slider-runnable-track {
      cursor: default;
    }

    &::-moz-range-track {
      cursor: default;
    }

    &::-ms-track {
      cursor: default;
    }
  }
`;

const Label = styled('label')`
  font-size: 14px;
  margin-bottom: ${p => p.theme.grid}px;
  color: ${p => p.theme.subText};
`;

const SliderAndInputWrapper = styled('div')<{showCustomInput?: boolean}>`
  display: grid;
  align-items: center;
  grid-auto-flow: column;
  grid-template-columns: 4fr ${p => p.showCustomInput && '1fr'};
  grid-gap: ${space(1)};
`;
