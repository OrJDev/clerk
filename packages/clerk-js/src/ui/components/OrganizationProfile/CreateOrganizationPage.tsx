import React from 'react';

import { useWizard, Wizard } from '../../common';
import { useCoreClerk, useCoreOrganization, useCoreOrganizations, useOrganizationProfileContext } from '../../contexts';
import { Button, Text } from '../../customizables';
import { Form, useCardState, withCardStateProvider } from '../../elements';
import { localizationKeys } from '../../localization';
import { handleError, useFormControl } from '../../utils';
import { FormButtonContainer } from '../UserProfile/FormButtons';
import { InviteMembersForm } from './InviteMembersForm';
import { ContentPage } from './OrganizationContentPage';
import { OrganizationProfileAvatarUploader } from './OrganizationProfileAvatarUploader';

export const CreateOrganizationPage = withCardStateProvider(() => {
  // const title = localizationKeys('userProfile.profilePage.title');
  const title = 'Create Organization';
  const subtitle = 'Set the organization profile';
  const card = useCardState();
  const [file, setFile] = React.useState<File>();
  const { createOrganization } = useCoreOrganizations();
  const { setActive, closeOrganizationProfile } = useCoreClerk();
  const { mode, navigateAfterOrganizationCreationUrl } = useOrganizationProfileContext();
  const { organization } = useCoreOrganization();

  const wizard = useWizard({ onNextStep: () => card.setError(undefined) });

  const nameField = useFormControl('name', '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__organizationName'),
    placeholder: localizationKeys('formFieldInputPlaceholder__organizationName'),
  });

  const dataChanged = !!nameField.value;
  const canSubmit = dataChanged || !!file;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }

    return createOrganization?.({ name: nameField.value })
      .then(org => (file ? org.setLogo({ file }) : org))
      .then(org => setActive({ organization: org }))
      .then(wizard.nextStep)
      .catch(err => handleError(err, [nameField], card.setError));
  };

  const completeFlow = () => {
    navigateAfterOrganizationCreationUrl();
    if (mode === 'modal') {
      closeOrganizationProfile();
    }
  };

  return (
    <Wizard {...wizard.props}>
      <ContentPage
        Breadcrumbs={null}
        headerTitle={title}
        headerSubtitle={subtitle}
      >
        <Form.Root onSubmit={onSubmit}>
          <OrganizationProfileAvatarUploader
            organization={{ name: nameField.value }}
            onAvatarChange={async file => await setFile(file)}
          />
          <Form.ControlRow>
            <Form.Control
              sx={{ flexBasis: '80%' }}
              {...nameField.props}
              required
            />
          </Form.ControlRow>
          <FormButtonContainer>
            <Form.SubmitButton
              block={false}
              isDisabled={!canSubmit}
              localizationKey={'Create organization'}
            />
            {mode === 'modal' && (
              <Form.ResetButton
                localizationKey={localizationKeys('userProfile.formButtonReset')}
                block={false}
                onClick={closeOrganizationProfile}
              />
            )}
          </FormButtonContainer>
        </Form.Root>
      </ContentPage>
      <ContentPage
        Breadcrumbs={null}
        headerTitle={title}
        headerSubtitle={subtitle}
      >
        <InviteMembersForm
          organization={organization!}
          resetButtonLabel={'Skip'}
          onSuccess={wizard.nextStep}
          onReset={completeFlow}
        />
      </ContentPage>
      {/*<SuccessPage*/}
      {/*  title={title}*/}
      {/*  text={'Invitations successfully sent'}*/}
      {/*/>*/}
      <ContentPage
        Breadcrumbs={null}
        headerTitle={title}
      >
        <Text
          localizationKey={'Invitations successfully sent'}
          variant='regularRegular'
        />
        <FormButtonContainer>
          <Button
            textVariant='buttonExtraSmallBold'
            block={false}
            autoFocus
            localizationKey={localizationKeys('userProfile.formButtonPrimary__finish')}
            onClick={completeFlow}
          />
        </FormButtonContainer>
      </ContentPage>
    </Wizard>
  );
});