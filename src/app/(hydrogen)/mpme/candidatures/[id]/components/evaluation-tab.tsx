'use client';

import { useState } from 'react';
import { PiStar, PiStarFill, PiChat, PiCheckCircle } from 'react-icons/pi';
import FormGroup from '@/app/shared/form-group';
import { Text, Button, Textarea, Badge } from 'rizzui';
import toast from 'react-hot-toast';

interface EvaluationTabProps {
  data: any;
}

export default function EvaluationTab({ data }: EvaluationTabProps) {
  const [score, setScore] = useState(data.score || 0);
  const [comments, setComments] = useState(data.evaluationComments || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitEvaluation = async () => {
    if (score === 0) {
      toast.error('Veuillez attribuer un score');
      return;
    }

    setIsSubmitting(true);
    try {
      // Appel API pour soumettre l'évaluation
      // await evaluateCandidature(data.id, { score, comments });
      toast.success('Évaluation enregistrée avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusLabel = () => {
    const statusMap: Record<string, string> = {
      submitted: 'Soumise',
      under_review: 'En cours d\'évaluation',
      preselected: 'Présélectionnée',
      selected: 'Sélectionnée',
      rejected: 'Rejetée',
    };
    return statusMap[data.status] || data.status;
  };

  const getStatusColor = () => {
    const colorMap: Record<string, string> = {
      submitted: 'warning',
      under_review: 'info',
      preselected: 'primary',
      selected: 'success',
      rejected: 'danger',
    };
    return colorMap[data.status] || 'secondary';
  };

  return (
    <>
      <FormGroup
        title="Évaluation de la candidature"
        description="Évaluez le projet et attribuez un score"
        className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
      />

      <div className="mb-10 grid gap-7">
        {/* Statut actuel */}
        <div className="rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <Text className="text-sm text-gray-500">Statut actuel</Text>
              <Badge color={getStatusColor()} className="mt-1">
                {getStatusLabel()}
              </Badge>
            </div>
            {data.score && (
              <div className="text-right">
                <Text className="text-sm text-gray-500">Score obtenu</Text>
                <div className="flex items-center gap-1">
                  <PiStarFill className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold">{data.score}</span>
                  <span className="text-gray-500">/100</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notation */}
        <div className="rounded-lg border border-gray-200 p-6">
          <Text className="mb-4 font-medium">Notation (0-100)</Text>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={score}
              onChange={(e) => setScore(parseInt(e.target.value))}
              className="flex-1"
            />
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setScore((i + 1) * 20)}
                  className="focus:outline-none"
                >
                  {score >= (i + 1) * 20 ? (
                    <PiStarFill className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <PiStar className="h-6 w-6 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
            <span className="text-xl font-bold">{score}</span>
            <span className="text-gray-500">/100</span>
          </div>
        </div>

        {/* Commentaires */}
        <div className="rounded-lg border border-gray-200 p-6">
          <Text className="mb-4 font-medium">Commentaires</Text>
          <Textarea
            placeholder="Saisissez vos commentaires sur la candidature..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={5}
          />
        </div>

        {/* Bouton d'évaluation */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmitEvaluation}
            isLoading={isSubmitting}
            disabled={score === 0}
            className="gap-2"
          >
            <PiCheckCircle className="h-4 w-4" />
            Enregistrer l'évaluation
          </Button>
        </div>
      </div>
    </>
  );
}