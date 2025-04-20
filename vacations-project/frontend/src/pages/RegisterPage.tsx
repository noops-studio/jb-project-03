import RegisterForm from '../components/auth/RegisterForm';
import Layout from '../components/layout/Layout';

const RegisterPage = () => {
  return (
    <Layout>
      <div className="max-w-md mx-auto py-8">
        <RegisterForm />
      </div>
    </Layout>
  );
};

export default RegisterPage;