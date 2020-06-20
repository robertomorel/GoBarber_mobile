/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useRef } from 'react';
import {
  Image,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';
import getValidationErrors from '../../utils/getValidationErrors';

import Input from '../../components/Input';
import Button from '../../components/Button';

import { useAuth } from '../../hooks/auth';

import {
  Container,
  Title,
  ForgotPassword,
  ForgotPasswordText,
  CreateAccountButton,
  CreateAccountButtonText,
} from './styles';

/**
 * Temos como imagens logo.png, logo@2x.png e logo@3x.png
 * PAra uso do logo, basta referenciar o logo.png.
 * O react-native irá se encarregar de escolher o melhor logo dependendo
 * da quantidade de pixels que tiver o aparelho.
 *
 * Para não dar erro na importação do .png, teve q ser criado o arquivo
 * "@types/index.d.ts"
 */
import logoImg from '../../assets/logo.png';

interface SignInFormData {
  email: string;
  password: string;
}

const SignIn: React.FC = () => {
  const { signIn, user } = useAuth();

  console.log(user);

  const formRef = useRef<FormHandles>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const navigation = useNavigation();

  const handleSignIn = useCallback(
    async (data: SignInFormData) => {
      try {
        formRef.current?.setErrors({});
        // -- Criando um schema de validação. Usado quando queremos validar um objeto inteiro.
        const schema = Yup.object().shape({
          email: Yup.string()
            .required('Email obrigatório!')
            .email('Digite um email válido!'),
          password: Yup.string().min(6, 'No mínimo 6 dígitos!'),
        });

        await schema.validate(data, {
          abortEarly: false, // -- Para retornar todos os erros que ele encontrar, não de um por um.
        });

        await signIn({
          email: data.email,
          password: data.password,
        });

        //history.push('/dashboard');
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);

          return;
        }

        Alert.alert(
          'Erro na autenticação',
          'Ocorreu um erro ao fazer login. Cheque as credenciais!',
        );
      }
    },
    [signIn],
  );

  /**
   * KeyboardAvoidingView serve para que o teclado do celular não atrapalhe
   * o conteúdo que tem na tela.
   * O comportamento depende da plataforma.
   */

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flex: 1 }}
        >
          <Container>
            <Image source={logoImg} />

            {/*
              Essa View foi colocada para corrigir o bug do texto que não
              sofria a animação do restante da tela quando o keyboard era
              acionado e o KeyboardAvoidingView disparado.
              Assim, a animação executa na View, não no Title
            */}
            <View>
              <Title>Faça seu logon</Title>
            </View>

            <Form ref={formRef} onSubmit={handleSignIn}>
              <Input
                name="email"
                icon="mail"
                placeholder="E-mail"
                autoCorrect={false} /* Não sugerir correção */
                autoCapitalize="none" /* Não iniciar com letra maiúscula */
                keyboardType="email-address" /* Mostrar o @ no keyboard */
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
              />
              <Input
                ref={passwordInputRef}
                secureTextEntry /* Deixar os *** */
                name="password"
                icon="lock"
                placeholder="Senha"
                returnKeyType="send" /* Transformar o ícone do return do keyboard */
                onSubmitEditing={() => {
                  // Função é disparada quando clicamos no botão do send (return)
                  // Usado para que o usuário não precise fechar o keyboard e depois submeter.
                  // Faz tudo de uma vez
                  formRef.current?.submitForm();
                }}
              />

              <Button
                onPress={() => {
                  formRef.current?.submitForm();
                }}
              >
                Entrar
              </Button>
            </Form>

            <ForgotPassword onPress={() => {}}>
              <ForgotPasswordText>Esqueci minha senha</ForgotPasswordText>
            </ForgotPassword>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>

      <CreateAccountButton onPress={() => navigation.navigate('SignUp')}>
        <Icon name="log-in" size={20} color="#ff9000" />
        <CreateAccountButtonText>Criar uma conta</CreateAccountButtonText>
      </CreateAccountButton>
    </>
  );
};

export default SignIn;
