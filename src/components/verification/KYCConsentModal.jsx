import { Building2, CreditCard, ExternalLink, Hash, ShieldCheck, User } from 'lucide-react';
import { Button } from '@components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';

const PRIVACY_POLICY_URL = 'https://modula.in/privacy-policy';

const DATA_POINTS = {
  pan: [
    { Icon: CreditCard, label: 'PAN number (10-digit identifier)' },
    { Icon: User, label: 'Name as per PAN records' },
  ],
  bank: [
    { Icon: Building2, label: 'Bank account number' },
    { Icon: Hash, label: 'IFSC code' },
    { Icon: User, label: 'Account holder name' },
  ],
};

const USAGE_COPY = {
  pan: 'Your PAN is used solely to verify your identity for regulatory compliance. It is stored securely and used to link your account for tax and payout purposes.',
  bank: 'Your bank details are used solely for processing payouts to your account. Details are verified via a trusted third-party service and stored securely.',
};

/**
 * Disclosure shown before any PAN or bank detail is captured. Mirrors the mobile
 * client's KYCConsentModal: the same data points, the same third-party processor,
 * so a partner sees one consistent notice whichever client they use.
 */
const KYCConsentModal = ({ open, onAccept, onDecline, type = 'pan' }) => {
  const dataPoints = DATA_POINTS[type] ?? DATA_POINTS.pan;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onDecline?.()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" />
            </span>
            <div>
              <DialogTitle className="text-lg">Data Collection Notice</DialogTitle>
              <DialogDescription className="text-xs">
                Required for KYC verification
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          <p className="text-sm text-muted-foreground">
            To verify your identity and enable payouts, we need to collect and process the
            following information:
          </p>

          <ul className="space-y-2 rounded-xl bg-muted/50 px-4 py-3">
            {dataPoints.map((point) => (
              <li key={point.label} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  {/* Member expression, not a destructured binding: this config has no
                      eslint-plugin-react, so JSX would not count as "used". */}
                  <point.Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                </span>
                <span className="text-sm">{point.label}</span>
              </li>
            ))}
          </ul>

          <div>
            <h3 className="mb-1 text-xs font-bold uppercase">How we use this data</h3>
            <p className="text-sm text-muted-foreground">{USAGE_COPY[type] ?? USAGE_COPY.pan}</p>
          </div>

          <div>
            <h3 className="mb-1 text-xs font-bold uppercase">Third-party processing</h3>
            <p className="text-sm text-muted-foreground">
              Verification is performed by Attestr Technologies, a licensed KYC provider. Your
              data is transmitted securely over encrypted channels and is not sold or shared
              for marketing.
            </p>
          </div>

          <a
            href={PRIVACY_POLICY_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline underline-offset-2"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Read our Privacy Policy
          </a>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button type="button" size="lg" className="w-full" onClick={onAccept}>
            I Understand &amp; Agree
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onDecline}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KYCConsentModal;
