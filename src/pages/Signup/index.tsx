/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useCallback } from 'react';
import {
  Image,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import Icon from 'react-native-vector-icons/Feather';
import * as Yup from 'yup';

import Input from '../../components/Input';
import Button from '../../components/Button';

import api from '../../services/api';

import { Container, Title, BackToSignIn, BackToSignInText } from './styles';

/**
 * Temos como imagens logo.png, logo@2x.png e logo@3x.png
 * Para uso do logo, basta referenciar o logo.png.
 * O react-native irá se encarregar de escolher o melhor logo dependendo
 * da quantidade de pixels que tiver o aparelho.
 *
 * Para não dar erro na importação do .png, teve q ser criado o arquivo
 * "@types/index.d.ts"
 */
import logoImg from '../../assets/logo.png';

import getValidationErrors from '../../utils/getValidationErrors';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}

const SignUp: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const navigation = useNavigation();
  const passwordInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);

  const handleSignUp = useCallback(
    async (data: SignUpFormData) => {
      try {
        formRef.current?.setErrors({});
        // -- Criando um schema de validação. Usado quando queremos validar um objeto inteiro.
        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório!'),
          email: Yup.string()
            .required('Email obrigatório!')
            .email('Digite um email válido!'),
          password: Yup.string().min(6, 'No mínimo 6 dígitos!'),
        });

        await schema.validate(data, {
          abortEarly: false, // -- Para retornar todos os erros que ele encontrar, não de um por um.
        });

        const response = await api.post('/users', data);
        console.log(response);

        Alert.alert(
          'Cadastro realizado com sucesso',
          'Você já pode fazer login na aplicação!',
        );

        navigation.navigate('SignIn');
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);

          return;
        }

        Alert.alert(
          'Erro no cadastro!',
          'Ocorreu um erro ao fazer cadastro. Tente novamente!',
        );
      }
    },
    [useCallback],
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
              <Title>Crie sua conta</Title>
            </View>

            <Form ref={formRef} onSubmit={handleSignUp}>
              <Input
                name="name"
                icon="user"
                placeholder="Nome"
                autoCorrect={false} /* Não sugerir correção */
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailInputRef.current?.focus();
                }}
              />

              <Input
                ref={emailInputRef}
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
                secureTextEntry
                name="password"
                icon="lock"
                placeholder="Senha"
                textContentType="newPassword"
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
                Cadastrar
              </Button>
            </Form>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>

      <BackToSignIn onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={20} color="#FFF" />
        <BackToSignInText>Voltar para logon</BackToSignInText>
      </BackToSignIn>
    </>
  );
};

export default SignUp;
