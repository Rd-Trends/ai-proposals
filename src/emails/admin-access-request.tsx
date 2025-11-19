import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type AdminAccessRequestEmailProps = {
  email: string;
  name: string;
  requestedAt?: string;
  dashboardUrl?: string;
};

export const AdminAccessRequestEmail = ({
  email,
  name,
  requestedAt = new Date().toLocaleString(),
  dashboardUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/waitlist`
    : "https://ai-proposals-pro.vercel.app/dashboard/waitlist",
}: AdminAccessRequestEmailProps) => (
  <Html>
    <Head />
    <Preview>
      New access request from {name} ({email})
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Access Request 📬</Heading>
        <Text style={text}>Someone has requested access to QuickRite:</Text>
        <Section style={infoBox}>
          <Text style={infoText}>
            <strong>Name:</strong> {name}
          </Text>
          <Text style={infoText}>
            <strong>Email:</strong> {email}
          </Text>
          <Text style={infoText}>
            <strong>Requested at:</strong> {requestedAt}
          </Text>
        </Section>
        <Hr style={hr} />
        <Text style={text}>To activate this user and grant them access:</Text>
        <Section style={buttonContainer}>
          <Button href={dashboardUrl} style={button}>
            View Waitlist Dashboard
          </Button>
        </Section>
        <Text style={text}>Or copy and paste this URL into your browser:</Text>
        <Link href={dashboardUrl} style={link}>
          {dashboardUrl}
        </Link>
        <Hr style={hr} />
        <Text style={footer}>
          This is an automated notification from QuickRite. You're receiving
          this because you're an administrator.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default AdminAccessRequestEmail;

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

const infoBox = {
  backgroundColor: "#f6f9fc",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px",
};

const infoText = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "4px 0",
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

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 24px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  padding: "0 24px",
  marginTop: "32px",
};
