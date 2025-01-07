import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { SyncIcon } from "@primer/octicons-react";
import { Link } from "../link/link";
import * as styles from "./header.css";
import type { AppUpdaterEvent } from "@types";
import { minutesToMilliseconds } from "date-fns";

export const releasesPageUrl =
  "https://github.com/hydralauncher/hydra/releases/latest";

const CHECK_FOR_UPDATES_INTERVAL = minutesToMilliseconds(60);

export function AutoUpdateSubHeader() {
  const [isReadyToInstall, setIsReadyToInstall] = useState(false);
  const [newVersion, setNewVersion] = useState<string | null>(null);
  const [isAutoInstallAvailable, setIsAutoInstallAvailable] = useState(false);

  const { t } = useTranslation("header");

  const handleClickInstallUpdate = () => {
    window.electron.restartAndInstallUpdate();
  };

  useEffect(() => {
    const unsubscribe = window.electron.onAutoUpdaterEvent(
      (event: AppUpdaterEvent) => {
        if (event.type == "update-available") {
          setNewVersion(event.info.version);
        }

        if (event.type == "update-downloaded") {
          setIsReadyToInstall(true);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      window.electron.checkForUpdates().then((isAutoInstallAvailable) => {
        console.log("checking for updates");
        setIsAutoInstallAvailable(isAutoInstallAvailable);
      });
    }, CHECK_FOR_UPDATES_INTERVAL);

    return () => {
      clearInterval(checkInterval);
    };
  }, []);

  if (!newVersion) return null;

  if (!isAutoInstallAvailable) {
    return (
      <header className={styles.subheader}>
        <Link to={releasesPageUrl} className={styles.newVersionLink}>
          <SyncIcon className={styles.newVersionIcon} size={12} />
          {t("version_available_download", { version: newVersion })}
        </Link>
      </header>
    );
  }

  if (isReadyToInstall) {
    return (
      <header className={styles.subheader}>
        <button
          type="button"
          className={styles.newVersionButton}
          onClick={handleClickInstallUpdate}
        >
          <SyncIcon className={styles.newVersionIcon} size={12} />
          {t("version_available_install", { version: newVersion })}
        </button>
      </header>
    );
  }

  return null;
}
