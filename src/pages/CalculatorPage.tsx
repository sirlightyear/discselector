import { useState, useEffect, useMemo } from 'react';
import { AppState, HandSide, LineShape, Recommendation } from '../types';
import { ProfileSection } from '../components/ProfileSection';
import { WindSection } from '../components/WindSection';
import { DistanceSection } from '../components/DistanceSection';
import { LineSection } from '../components/LineSection';
import { RecommendationsSection } from '../components/RecommendationsSection';
import { ProTuneSection } from '../components/ProTuneSection';
import { parseURLState, buildURL, shouldSkipProfileUI } from '../utils/urlState';
import { loadCoefficients, saveCoefficients } from '../utils/storage';
import { normalizeWind, generateRecommendations } from '../utils/algorithm';
import { DEFAULT_COEFFICIENTS } from '../constants';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { UserSettings } from '../lib/database.types';

export function CalculatorPage() {
  const { user } = useUser();
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  useEffect(() => {
    if (user) {
      supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.user_id)
        .maybeSingle()
        .then(({ data }) => {
          setUserSettings(data);
          setIsLoadingSettings(false);
        });
    } else {
      setIsLoadingSettings(false);
    }
  }, [user]);

  const [state, setState] = useState<AppState>(() => {
    const urlState = parseURLState();
    return {
      side: urlState.side || null,
      bh: urlState.bh !== undefined ? urlState.bh : true,
      fh: urlState.fh !== undefined ? urlState.fh : false,
      arm: urlState.arm || 10,
      wd: urlState.wd || null,
      ws: urlState.ws || null,
      dist: urlState.dist || null,
      shape: urlState.shape || 'straight',
      curv: urlState.curv !== undefined ? urlState.curv : 0,
    };
  });

  useEffect(() => {
    if (!isLoadingSettings && userSettings?.hand_preference && !state.side) {
      setState((prev) => ({
        ...prev,
        side: userSettings.hand_preference as HandSide
      }));
    }
  }, [isLoadingSettings, userSettings, state.side]);

  const [coefficients, setCoefficients] = useState(() => loadCoefficients());
  const [skipProfile] = useState(() => shouldSkipProfileUI(parseURLState()));

  useEffect(() => {
    if (!state.bh && !state.fh) {
      setState((prev) => ({ ...prev, bh: true }));
    }
  }, [state.bh, state.fh]);

  const recommendations: Recommendation[] = useMemo(() => {
    if (
      !state.side ||
      state.wd === null ||
      state.ws === null ||
      state.dist === null
    ) {
      return [];
    }

    const wind = normalizeWind(state.wd, state.ws);
    return generateRecommendations(
      state.side,
      state.bh,
      state.fh,
      state.arm,
      wind,
      state.ws,
      state.shape,
      state.curv,
      state.dist,
      coefficients
    );
  }, [
    state.side,
    state.bh,
    state.fh,
    state.arm,
    state.wd,
    state.ws,
    state.dist,
    state.shape,
    state.curv,
    coefficients,
  ]);

  const handleSaveCoefficients = () => {
    saveCoefficients(coefficients);
  };

  const handleResetCoefficients = () => {
    setCoefficients({ ...DEFAULT_COEFFICIENTS });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-200 via-purple-200 to-pink-200">

      <main className="max-w-4xl mx-auto px-4 py-8">
        <ProfileSection
          side={state.side}
          bh={state.bh}
          fh={state.fh}
          arm={state.arm}
          onSideChange={(side: HandSide) =>
            setState((prev) => ({ ...prev, side }))
          }
          onBHChange={(bh) => setState((prev) => ({ ...prev, bh }))}
          onFHChange={(fh) => setState((prev) => ({ ...prev, fh }))}
          onArmChange={(arm) => setState((prev) => ({ ...prev, arm }))}
          skipProfile={skipProfile}
        />

        {state.side && (
          <>
            <WindSection
              wd={state.wd}
              ws={state.ws}
              onWindDirectionChange={(wd) =>
                setState((prev) => ({ ...prev, wd }))
              }
              onWindSpeedChange={(ws) =>
                setState((prev) => ({ ...prev, ws }))
              }
            />

            <DistanceSection
              dist={state.dist}
              onDistanceChange={(dist) =>
                setState((prev) => ({ ...prev, dist }))
              }
            />

            <LineSection
              shape={state.shape}
              curv={state.curv}
              onLineChange={(shape: LineShape, curv: number) =>
                setState((prev) => ({ ...prev, shape, curv }))
              }
            />

            <RecommendationsSection recommendations={recommendations} />

            <ProTuneSection
              coefficients={coefficients}
              onCoefficientsChange={setCoefficients}
              onSave={handleSaveCoefficients}
              onReset={handleResetCoefficients}
            />
          </>
        )}
      </main>
    </div>
  );
}
