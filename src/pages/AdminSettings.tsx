
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PasswordResetForm from "@/components/PasswordResetForm";
import { Helmet } from 'react-helmet';

const AdminSettings = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Admin Settings | Washroom Designer</title>
      </Helmet>
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
            <PasswordResetForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(AdminSettings);
