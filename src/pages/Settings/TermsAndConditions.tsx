import { Anchor, Flex, Table, Text, Title } from "@mantine/core";
import { HeadAndBodyStmts } from "./PrivacyPolicyStatement";

type Props = {};

const TermsAndConditions = (props: Props) => {
  return (
    <Flex justify={"center"} h="100%">
      <Flex direction={"column"} gap={3} p={"lg"}>
        <Title order={2}> Privacy Policy for BlueDibs </Title>

        <Text color="dimmed" size={"sm"}>
          Welcome to BlueDibs, a social media platform that allows users to
          create accounts, share content, and engage with a unique financial
          element. These Terms and Conditions govern your use of the BlueDibs
          platform. By using the platform, you agree to be bound by these terms.
        </Text>

        <HeadAndBodyStmts
          title={" 1. User Accounts "}
          subHeads={[
            `Welcome to BlueDibs, a social media platform that allows users to create accounts, share content, and engage with a unique financial element. These Terms and Conditions govern your use of the BlueDibs platform. By using the platform, you agree to be bound by these terms.`,
          ]}
        />

        <HeadAndBodyStmts
          title={" 2. Use of Information"}
          subHeads={[
            `2.1. To use BlueDibs, you must create a user account. You agree to provide accurate and complete information during the registration process.`,
            `2.2. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.`,
            `2.3. You must be at least 18 years old to use BlueDibs.`,
          ]}
        />

        <HeadAndBodyStmts
          title={" 3. Content Sharing and Dilution"}
          subHeads={[
            `3.1. Users can upload and share videos/photos on BlueDibs.`,
            `3.2. Each user starts with a default share price of INR 1. Users have the option to dilute their account shares, ranging from 10 crores INR to 1000 crores INR.`,
            `3.3. Users can buy shares of other accounts using real money.`,
          ]}
        />

        <HeadAndBodyStmts
          title={" 4. Financial Transactions"}
          subHeads={[
            `4.1. All financial transactions are conducted through secure payment gateways. BlueDibs is not responsible for any issues related to payment processing.`,
            `4.2. Users must comply with applicable laws and regulations when engaging in financial transactions on the platform.`,

            `4.1. All financial transactions are conducted through secure payment gateways. BlueDibs is not responsible for any issues related to payment processing.`,
          ]}
        />

        <HeadAndBodyStmts
          title={"5. Prohibited Content"}
          subHeads={[
            `5.1. Users are prohibited from sharing content that is illegal, offensive, harmful, or violates the rights of others.`,
            `5.2. BlueDibs reserves the right to remove any content that violates these terms.`,
          ]}
        />

        <HeadAndBodyStmts
          title={" 6. Intellectual Property"}
          subHeads={[
            `
            6.1. Users retain ownership of the content they upload, but grant BlueDibs a non-exclusive, worldwide, royalty-free license to use, display, and distribute their content.`,
            `
            6.2. Users may not use BlueDibs to infringe on the intellectual property rights of others.`,
          ]}
        />

        <HeadAndBodyStmts
          title={" 7. Termination"}
          subHeads={[
            `
            7.1. BlueDibs may, at its discretion, terminate or suspend a user's account for violation of these terms.`,
          ]}
        />
        <HeadAndBodyStmts
          title={" 8. Disclaimer of Warranties"}
          subHeads={[
            `
            8.1. BlueDibs is provided "as is" and without warranties of any kind, express or implied.`,
          ]}
        />
        <HeadAndBodyStmts
          title={" 9. Limitation of Liability"}
          subHeads={[
            `
            9.1. BlueDibs shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the platform.`,
          ]}
        />
        <HeadAndBodyStmts
          title={" 10. Governing Law"}
          subHeads={[
            `
            10.1. These terms shall be governed by and construed in accordance with the laws of India.`,
          ]}
        />
        <HeadAndBodyStmts
          title={" 11. Changes to Terms"}
          subHeads={[
            `
            11.1. BlueDibs reserves the right to update or modify these terms at any time. Users will be notified of any material changes.`,
          ]}
        />
      </Flex>
    </Flex>
  );
};

export default TermsAndConditions;
