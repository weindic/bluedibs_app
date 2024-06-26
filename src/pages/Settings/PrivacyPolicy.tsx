import { Anchor, Flex, Table, Text, Title } from "@mantine/core";
import { HeadAndBodyStmts } from "./PrivacyPolicyStatement";

type Props = {};

const PrivacyPolicy = (props: Props) => {
  return (
    <Flex justify={"center"} h="100%">
      <Flex direction={"column"} gap={3} p={"lg"}>
        <Title order={2}> Privacy Policy for BlueDibs </Title>

        <Text color="dimmed" size={"sm"}>
          This Privacy Policy outlines the types of personal information
          collected, used, and shared by BlueDibs ("we," "our," or "us") and how
          it is safeguarded. By using the BlueDibs app, you agree to the terms
          of this Privacy Policy.
        </Text>

        <HeadAndBodyStmts
          title={" 1. Information We Collect"}
          subHeads={[
            `a. User-Provided Information: We collect information you provide when
            creating an account, including but not limited to your name, email
            address, profile picture, and any other optional information you
            choose to share.`,
            `          b. Content: Users can upload and share content, including photos and
            videos, which may include personal information.`,
            `          c. Transaction Information: When users engage in buying or selling
            shares on BlueDibs, we may collect transaction-related information.`,
          ]}
        />

        <HeadAndBodyStmts
          title={" 2. Use of Information"}
          subHeads={[
            `a. Personalization: We use collected information to personalize the user experience, provide content recommendations, and enhance app functionality.
            `,
            `b. Communication: We may use your contact information to communicate with you regarding updates, promotions, and important information about BlueDibs.`,
            `c. Transactions: To facilitate share transactions, we may use transaction-related information as necessary.`,
          ]}
        />

        <HeadAndBodyStmts
          title={" 3. Sharing of Information"}
          subHeads={[
            `a. User Shares: Users may choose to make their shares available for purchase by others. In this case, limited information about the user may be shared with potential buyers.`,
            `b. Third-Party Services: We may share information with third-party service providers for purposes such as data processing, marketing, and analytics.`,
          ]}
        />

        <HeadAndBodyStmts
          title={" 4. Security and Data Retention"}
          subHeads={[
            `We implement reasonable security measures to protect the information we collect. However, no method of transmission or storage is completely secure. We retain user information for as long as necessary to provide services and as required by law.`,
          ]}
        />

        <HeadAndBodyStmts
          title={" 5. Changes to this Privacy Policy"}
          subHeads={[
            `
            We may update this Privacy Policy periodically. You will be notified of any material changes.`,
          ]}
        />

        <HeadAndBodyStmts
          title={" 6. Contact Us"}
          subHeads={[
            `
            If you have questions or concerns about this Privacy Policy, please contact us at support@bluedibs.com.`,
          ]}
        />
      </Flex>
    </Flex>
  );
};

export default PrivacyPolicy;
