import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GrammarIssue } from './recording.entity';

export interface GrammarCheckResult {
  correctedText: string;
  issues: GrammarIssue[];
}

interface LanguageToolMatch {
  message: string;
  offset: number;
  length: number;
  replacements: { value: string }[];
}

@Injectable()
export class GrammarService {
  private readonly logger = new Logger(GrammarService.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>(
      'GRAMMAR_URL',
      'http://languagetool:8010',
    );
  }

  async check(text: string): Promise<GrammarCheckResult | null> {
    if (!text.trim()) return null;

    try {
      const response = await fetch(`${this.baseUrl}/v2/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ text, language: 'en-US' }),
      });
      if (!response.ok) {
        throw new Error(`LanguageTool returned ${response.status}`);
      }
      const data = (await response.json()) as { matches: LanguageToolMatch[] };

      const issues: GrammarIssue[] = data.matches.map((match) => ({
        message: match.message,
        offset: match.offset,
        length: match.length,
        replacements: match.replacements.map((r) => r.value),
      }));

      const correctedText = applyCorrections(text, issues);
      return { correctedText, issues };
    } catch (err) {
      this.logger.warn(`Grammar check failed: ${(err as Error).message}`);
      return null;
    }
  }
}

function applyCorrections(text: string, issues: GrammarIssue[]): string {
  const sorted = [...issues].sort((a, b) => b.offset - a.offset);
  let result = text;
  for (const issue of sorted) {
    if (!issue.replacements.length) continue;
    result =
      result.slice(0, issue.offset) +
      issue.replacements[0] +
      result.slice(issue.offset + issue.length);
  }
  return result;
}
