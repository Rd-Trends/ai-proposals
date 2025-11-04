import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface UserActivatedEmailProps {
  email: string;
  signupUrl?: string;
}

export const UserActivatedEmail = ({
  email,
  signupUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/signup`
    : "https://ai-proposals-pro.vercel.app/auth/signup",
}: UserActivatedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your access to QuickRite has been activated! 🎉</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to QuickRite! 🎉</Heading>
          <Text style={text}>
            Great news! Your access to QuickRite has been activated.
          </Text>
          <Text style={text}>
            You can now sign up and start creating winning proposals for your
            freelance projects.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={signupUrl}>
              Sign Up Now
            </Button>
          </Section>
          <Text style={text}>
            Or copy and paste this URL into your browser:
          </Text>
          <Link href={signupUrl} style={link}>
            {signupUrl}
          </Link>
          <Text style={text}>
            Your registered email: <strong>{email}</strong>
          </Text>
          <Text style={footer}>
            If you didn't request access to QuickRite, you can safely ignore
            this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default UserActivatedEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "560px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 24px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 24px",
};

const buttonContainer = {
  padding: "27px 24px",
};

const button = {
  backgroundColor: "#000",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
};

const link = {
  color: "#2754C5",
  fontSize: "14px",
  textDecoration: "underline",
  padding: "0 24px",
  wordBreak: "break-all" as const,
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 24px",
  marginTop: "32px",
};
