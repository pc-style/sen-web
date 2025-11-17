import React from 'react';
import { Player } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy } from 'lucide-react';

interface ScoreboardProps {
  players: Player[];
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ players }) => {
  return (
    <div className="rounded-lg border border-purple-200/40 bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-3 sm:p-4">
      <h3 className="mb-3 flex items-center justify-center gap-2 text-center font-heading text-lg font-semibold text-gray-800 sm:text-xl">
        <Trophy className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
        Scoreboard
      </h3>
      <Table>
        <TableHeader>
          <TableRow className="border-purple-200/30 hover:bg-transparent">
            <TableHead className="text-sm font-semibold text-gray-700 sm:text-base">
              Player
            </TableHead>
            <TableHead className="text-right text-sm font-semibold text-gray-700 sm:text-base">
              Score
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow
              key={player.id}
              className="border-purple-200/30 hover:bg-purple-100/30"
            >
              <TableCell className="text-sm font-medium text-gray-800 sm:text-base">
                {player.name}
              </TableCell>
              <TableCell className="text-right font-mono text-sm font-semibold text-gray-800 sm:text-base">
                {player.score}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
