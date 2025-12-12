export class RiskEngine {
  /**
   * Calculates Value at Risk (VaR).
   * Formula: Portfolio Value * Volatility * Z-Score
   */
  public static calculateVaR(portfolioValue: number, volatility: number, confidenceLevel: number): number {
      const zScore = this.getZScore(confidenceLevel);
      return parseFloat((portfolioValue * volatility * zScore).toFixed(2));
  }

  /**
   * Checks if current exposure exceeds the limit.
   */
  public static checkExposureBreach(currentExposure: number, limit: number): boolean {
      return currentExposure > limit;
  }

  private static getZScore(confidenceLevel: number): number {
      if (confidenceLevel >= 0.99) return 2.33;
      if (confidenceLevel >= 0.95) return 1.96;
      return 1.645; // 90%
  }
}
