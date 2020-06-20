import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { TextInputProps } from 'react-native';
import { useField } from '@unform/core';

import { Container, TextInput, Icon } from './styles';

interface InputProps extends TextInputProps {
  name: string;
  icon: string;
}

interface InputValueReference {
  value: string; // -- PAra armazenar o valor do input pelo 'onChangeText'
}

interface InputRef {
  focus(): void; // -- É a única informação que vamos precisar
}

/**
 * Este componente input não será do tipo React.FC por usa situação muito
 * específica. Precisaremos passar para ele a "ref" para ser utilizada.
 * Ex.: a referência de uma input deverá ser usada por outro input.
 *
 * Neste caso, este componente será do tipo React.RefForwardingComponent,
 * que recebe dois parâmetros
 */
const Input: React.RefForwardingComponent<InputRef, InputProps> = (
  { name, icon, ...rest },
  ref,
) => {
  const inputElementRef = useRef<any>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  const { registerField, defaultValue = '', fieldName, error } = useField(name);
  const inputValueRef = useRef<InputValueReference>({ value: defaultValue });

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);
    setIsFilled(!!inputValueRef.current.value);
  }, []);

  /**
   * useImperativeHandle é um hook do react para passar informações do componente
   * filho para um componente pai.
   *
   * O primeiro parâmetro é qual elemento quero passar;
   * O segundo parâmetro é uma função que retorna quais informações quero jogar dentro da ref
   */
  useImperativeHandle(ref, () => ({
    // criando um método por dentro do componente filho
    focus() {
      inputElementRef.current.focus();
    },
  }));

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputValueRef.current,
      path: 'value',
      setValue(ref: any, value: string) {
        // O que vai acontecer no input quando recebemos um novo valor no unform
        inputValueRef.current.value = value;
        inputElementRef.current.setNativeProps({ text: value });
      },
      clearValue() {
        // O que vai acontecer no input quando quando o valor for limpo no unform
        inputValueRef.current.value = '';
        inputElementRef.current.clear();
      },
    });
  }, [fieldName, registerField]);

  return (
    <Container isFocused={isFocused} isErrored={!!error}>
      <Icon
        name={icon}
        size={20}
        color={isFocused || isFilled ? '#ff9000' : '#666360'}
      />

      <TextInput
        ref={inputElementRef}
        keyboardAppearance="dark"
        placeholderTextColor="#666360"
        defaultValue={defaultValue}
        onChangeText={value => {
          // Sempre que o valor mudar, do input, ele ficará no "inputValueRef.current.value"
          inputValueRef.current.value = value;
        }}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        {...rest}
      />
    </Container>
  );
};

export default forwardRef(Input);
